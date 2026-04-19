import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@personio-web/auth-context';
import { useAmplitude } from '@personio-web/amplitude-provider';
import { Controls } from 'designSystem/component/control-bar';
import type {
  ColumnFilter,
  ColumnConfig,
  FilterConfig,
} from 'designSystem/component/advanced-filter';
import {
  PersonSystemAttribute,
  getAttributeIcon,
} from '@personio-web/employees-organizations-util-people';
import {
  useQueryOrgUnits,
  type UseQueryOrgUnitsGoferReturnType,
} from '@personio-web/employees-organizations-hook-use-query-org-units';
import { createOrgUnitsFilterConfig } from '@personio-web/employees-organizations-hook-use-people-filter-config/src/utils/createOrgUnitsFilterConfig';
import { createMultiSelectFilterConfig } from '@personio-web/employees-organizations-hook-use-people-filter-config/src/utils/createMultiSelectFilterConfig';
import { useListOrgChartLegalEntityFilterables } from '@personio-web/employees-organizations-gofer';
import { useHierarchicalData } from '@personio-web/employees-organizations-hook-use-hierarchical-data';

import * as Amp from '../../../constants/amplitude';
import { type Source } from '../../../sources/preferences/types';
import { TestIds } from '../../../utils';
import {
  type MultiSettablePrefs,
  useOrgChartPreferencesContext,
} from '../../../contexts';

const getFilterableAttrs = (source: Source) => {
  const firstAttr =
    source === 'Department'
      ? PersonSystemAttribute.Department
      : PersonSystemAttribute.Team;
  const secondAttr =
    source === 'Department'
      ? PersonSystemAttribute.Team
      : PersonSystemAttribute.Department;

  return [
    firstAttr,
    secondAttr,
    PersonSystemAttribute.Office,
    PersonSystemAttribute.LegalEntity,
  ] as const;
};

const useListOrgUnits = (type: 'department' | 'team') => {
  const orgUnitsData = useQueryOrgUnits<UseQueryOrgUnitsGoferReturnType>({
    source: 'org-units-table',
    type,
    useLegacyId: true,
    queryConfig: {
      autoFetchNextPage: true,
      additionalParams: {
        includeDescendants: true,
        includeDepartmentId: true,
        includeTeamId: true,
        includeDirectMemberCount: true,
      },
    },
  });

  const hierarchy = useHierarchicalData({
    data: orgUnitsData.orgUnits.map((node) => node.data),
    config: {
      getId: (node) => node.id.id,
      getParentId: (node) =>
        type === 'department'
          ? (node.parent?.departmentId as any)?.id
          : (node.parent?.teamId as any)?.id,
    },
  });

  const filteredOrgUnits = useMemo(() => {
    if (!orgUnitsData.orgUnits.length) return [];

    const whiteListedIds = new Set<string>();
    hierarchy.nodes.forEach((node) => {
      if (!node.data.directMemberCount) return;
      whiteListedIds.add(node.data.id.id);
      node.ancestors.forEach((ancestor) =>
        whiteListedIds.add(ancestor.data.id.id),
      );
    });

    if (type === 'department') console.log('[]', hierarchy.nodes);
    if (type === 'department') console.log('[]', [...whiteListedIds.values()]);

    return orgUnitsData.orgUnits.filter((orgUnit) =>
      whiteListedIds.has(orgUnit.data.id.id),
    );
  }, [orgUnitsData.orgUnits, hierarchy.nodes]);

  return filteredOrgUnits;
};

OrgUnitFilters.displayName = 'Controls.Filter';
