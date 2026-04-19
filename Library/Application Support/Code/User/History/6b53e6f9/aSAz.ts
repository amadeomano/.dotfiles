import { useMemo } from 'react';
import {
  type DefaultOperatorName,
  formatQuery,
  type RuleType,
} from 'react-querybuilder';

import { type ColumnFilter } from 'designSystem/component/advanced-filter';
import { useFilterOrgUnitsByEmployees } from '@personio-web/employees-organizations-gofer';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';

import { useOrgChartPreferencesContext } from '../../../../contexts/useOrgChartPreferences';
import { type OrgChartFilter } from '../../../../types';
import { type Source } from '../../../preferences/types';

export const useGetFilterConditions = (enabled: boolean) => {
  const prefs = useOrgChartPreferencesContext();

  const directFilters: ColumnFilter[] = [];
  const indirectFilters: ColumnFilter[] = [];

  prefs.filters.forEach((filter) => {
    const isSourceDepartment = prefs.source === 'Department';
    const isSourceTeam = prefs.source === 'Team';

    const isDepartmentFilter = filter.id === PersonSystemAttribute.Department;
    const isTeamFilter = filter.id === PersonSystemAttribute.Team;

    if (
      (isSourceDepartment && isDepartmentFilter) ||
      (isSourceTeam && isTeamFilter)
    ) {
      directFilters.push(filter);
    } else {
      indirectFilters.push(filter);
    }
  });

  const filterExp =
    mapFilterQuery({
      enabled,
      filters: indirectFilters,
      isDirect: false,
    }) ?? '';
  const orgUnitsByEmployee = useFilterOrgUnitsByEmployees({
    variables: { filterExp, includeDepartment: true, includeTeam: true },
    queryOptions: { enabled: enabled && !!filterExp },
  });

  const legacyIds = useMemo(
    () => [
      ...new Set(
        orgUnitsByEmployee.data?.data?.result?.employmentsList
          .map((emp) => {
            if (prefs.source === 'Department')
              return emp.departmentOrgUnit?.legacyId?.id;
            else if (prefs.source === 'Team')
              return emp.teamOrgUnit?.legacyId?.id;
          })
          .filter((id) => id !== undefined && id !== null) ?? [],
      ),
    ],
    [prefs.filters, orgUnitsByEmployee.status],
  );

  const conditions = useMemo(
    () =>
      mapFilterQuery({
        enabled,
        filters: directFilters,
        extraRules: [
          {
            id: 'legacy_id',
            value: { condition: 'contains', value: legacyIds },
          },
        ],
        source: prefs.source,
        isDirect: true,
      }),
    [prefs.filters, legacyIds],
  );

  return conditions;
};

const supportedFilterConditions = ['contains', 'does_not_contain'];
const conditionToOperatorMap: Record<string, DefaultOperatorName> = {
  contains: 'in',
  does_not_contain: 'notIn',
};
const directAttributeFilterName: Record<string, string> = {
  [PersonSystemAttribute.Department]: 'legacy_id',
  [PersonSystemAttribute.Team]: 'legacy_id',
};

const indirectAttributeFilterName: Record<string, string> = {
  [PersonSystemAttribute.Department]: 'department.id',
  [PersonSystemAttribute.Team]: 'team.id',
  [PersonSystemAttribute.Office]: 'office.id',
  [PersonSystemAttribute.LegalEntity]: 'legal_entity_id',
};

function isValidFilter(
  filter: ColumnFilter | OrgChartFilter,
): filter is OrgChartFilter {
  if (!supportedFilterConditions.includes(String(filter.value.condition))) {
    console.error(
      `Filter condition ${filter.value.condition} is not currently supported`,
    );
    return false;
  }

  if (
    filter.value.value !== undefined &&
    (!Array.isArray(filter.value.value) ||
      filter.value.value.length === 0 ||
      filter.value.value.some((item) => typeof item !== 'string'))
  ) {
    console.error(
      `Filter value ${JSON.stringify(
        filter.value.value,
      )} is not currently supported`,
    );
    return false;
  }

  return true;
}

type MapFilterQueryProps = {
  enabled?: boolean;
  filters?: ColumnFilter[];
  extraRules?: ColumnFilter[];
  source?: Source;
  isDirect?: boolean;
}
function mapFilterQuery({
  enabled = false,
  filters = [],
  extraRules = [],
  source,
  isDirect = false,
}: ): string | undefined {
  if (!enabled) return undefined;
  const rules: RuleType[] = [];
  const attributeFilterName = isDirect
    ? directAttributeFilterName
    : indirectAttributeFilterName;

  [...filters, ...extraRules].forEach((filter) => {
    if (!isValidFilter(filter)) return;

    rules.push({
      field: attributeFilterName[filter.id] ?? filter.id,
      operator: conditionToOperatorMap[filter.value.condition],
      value: filter.value.value,
    });
  });

  if (rules.length === 0) return undefined;
  if (source) rules.push({ field: 'type', operator: '=', value: source });
  return formatQuery({ combinator: 'and', rules }, { format: 'cel' });
}
