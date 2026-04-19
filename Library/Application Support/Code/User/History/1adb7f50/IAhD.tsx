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

  if (type === 'department') console.log('[] data', orgUnitsData.orgUnits);
  const hierarchy = useHierarchicalData({
    data: orgUnitsData.orgUnits.map((node) => node.data),
    config: {
      getId: (node) => node.id.id,
      getParentId: (node) => node.parentId?.id,
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

    if (type === 'department') console.log('[]', hierarchy);
    if (type === 'department') console.log('[]', [...whiteListedIds.values()]);

    return orgUnitsData.orgUnits.filter((orgUnit) =>
      whiteListedIds.has(orgUnit.data.id.id),
    );
  }, [orgUnitsData.orgUnits, hierarchy.nodes]);

  return filteredOrgUnits;
};

export const OrgUnitFilters = () => {
  const authContext = useAuthContext();
  const employeeId =
    authContext?.entityType === 'employee' ? authContext.employeeId : 0;
  const prefs = useOrgChartPreferencesContext();
  const { t: tAttributes } = useTranslation('models', {
    keyPrefix: 'employee',
  });

  const departments = useListOrgUnits('department');
  const teams = useListOrgUnits('team');

  const { data: legalEntitiesData } = useListOrgChartLegalEntityFilterables();

  const getOrgUnits = useCallback(
    (id: PersonSystemAttribute) => {
      if (id === PersonSystemAttribute.Department) return departments;
      if (id === PersonSystemAttribute.Team) return teams;
    },
    [departments, teams],
  );

  const createLegalEntityFilterConfig = useCallback((): FilterConfig => {
    const legalEntities =
      legalEntitiesData?.data?.legalEntities?.legalEntitiesList ?? [];

    return {
      columnId: PersonSystemAttribute.LegalEntity,
      field: 'multiselect',
      conditions: ['contains'],
      getOptions: async () =>
        legalEntities.map((entity) => ({
          id: entity.id.id,
          value: entity.id.id,
          label: entity.name,
        })),
    };
  }, [legalEntitiesData]);

  const filterConfigs = useMemo(() => {
    return getFilterableAttrs(prefs.source).map((id) => {
      if (
        id === PersonSystemAttribute.Department ||
        id === PersonSystemAttribute.Team
      ) {
        return createOrgUnitsFilterConfig(
          id,
          false,
          '',
          undefined,
          ['contains'],
          getOrgUnits(id) ?? [],
        );
      }
      if (id === PersonSystemAttribute.LegalEntity) {
        return createLegalEntityFilterConfig();
      }
      return createMultiSelectFilterConfig(
        employeeId,
        id,
        false, // no empty OrgUnit option
        '',
      );
    });
  }, [prefs.source, getOrgUnits, createLegalEntityFilterConfig, employeeId]);

  const columnConfig: ColumnConfig[] = useMemo(
    () =>
      getFilterableAttrs(prefs.source).map((id) => ({
        id,
        header: tAttributes(id),
        icon: getAttributeIcon(id),
      })),
    [prefs.source],
  );

  const amplitude = useAmplitude();
  const handleSetFilters = useCallback(
    (filters: ColumnFilter[]) => {
      const newPrefs: MultiSettablePrefs = { filters };
      if (filters.length) newPrefs.activeCardId = null;

      prefs.setMultiplePrefs({
        ...newPrefs,
        expansionState: [], // reset expansion so it'll be derived after fetching person data
      });

      const newViewportState: typeof prefs.viewportState.requestedState =
        filters.length === 0 && prefs.activeCardId
          ? {
              mode: 'fitNode',
              animated: true,
              nodeId: prefs.activeCardId,
              includeChildrenAndParent: true,
            }
          : {
              mode: 'resetViewport',
              animated: true,
            };
      prefs.viewportState.requestNewState(newViewportState);

      if (prefs.view) prefs.setView(null);

      const filterIds = filters.map((f) => f.id);
      amplitude.track(Amp.APPLIED_FILTER, {
        attributes: filterIds,
        org_chart_source: prefs.source,
      });
    },
    [prefs],
  );

  return (
    <Controls.Filter
      filters={prefs.filters}
      filterConfig={filterConfigs}
      columnConfig={columnConfig}
      metadata={{ testId: TestIds.ControlBarFilter }}
      onChange={handleSetFilters}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          return;
        }

        amplitude.track(Amp.INTERACTED_CONTROL_BAR, {
          item_clicked: 'filters',
          org_chart_source: prefs.source,
        });
      }}
    />
  );
};

OrgUnitFilters.displayName = 'Controls.Filter';
