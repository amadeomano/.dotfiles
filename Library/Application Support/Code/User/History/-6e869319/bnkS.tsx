import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type ListOrgUnitsQueryResult,
  useListOrgUnits,
} from '@personio-web/employees-organizations-gofer';
import {
  useGetSearchEmployees,
  type GetSearchEmployeesData,
} from '@personio-web/employees-organizations-data-search-employees';
import { OptionLabel, type PickerOption } from 'designSystem/component/picker';

import { useAuthContext } from '@personio-web/auth-context';
import { useAmplitude } from '@personio-web/amplitude-provider';
import { useOrgChartPreferencesContext } from '../../../../contexts';
import { type Source } from '../../../../sources/preferences/types';
import { SEARCH_MIN_CHARACTER_LENGTH } from '../../../../constants';
import { toTranslate } from '../../../../toTranslate';
import * as Amp from '../../../../constants/amplitude';
import { mapEmployeeOption } from './useGetSupervisorSearchResults';

type OrgUnitItem = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];
type EmployeeItem = GetSearchEmployeesData['data']['employees'][number];
type SearchResultItem = PickerOption & { group?: string };

type UseGetOrgUnitSearchResultsArgs = {
  searchTerm?: string;
};
type UseGetOrgUnitSearchResultsReturn = {
  searchResults: SearchResultItem[];
  isLoading: boolean;
};

const orgUnitFilter: Record<Source, string> = {
  Supervisor: '',
  Department: 'type == department',
  Team: 'type == team',
};

export const ORG_UNIT_PREFIX = 'org-unit-';

const filterEmployeesBySearchTerm =
  (searchTerm?: string) => (employee: EmployeeItem) =>
    employee.name.toLowerCase().includes(searchTerm?.toLowerCase() ?? '');

export const useGetOrgUnitSearchResults = ({
  searchTerm,
}: UseGetOrgUnitSearchResultsArgs): UseGetOrgUnitSearchResultsReturn => {
  const { companyId } = useAuthContext();
  const { track } = useAmplitude();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar',
  });

  const prefs = useOrgChartPreferencesContext();
  const enabled = (searchTerm?.length ?? 0) > SEARCH_MIN_CHARACTER_LENGTH;

  const orgUnits = useListOrgUnits({
    variables: {
      companyId,
      includeDepartmentId: true,
      includeTeamId: true,
      filter: `${
        orgUnitFilter[prefs.source]
      } && name.contains('${searchTerm}')`,
    },
    queryOptions: { enabled },
  });

  const employees = useGetSearchEmployees({
    requestQuery: { query: searchTerm },
    enabled,
  });

  const orgUnitItems: OrgUnitItem[] = useMemo(() => {
    if (orgUnits.isFetching) return [];
    return orgUnits.data?.data?.orgUnits?.orgUnitsList ?? [];
  }, [orgUnits.isFetching]);

  const employeesItems: EmployeeItem[] = useMemo(() => {
    if (employees.isFetching) return [];
    return employees.data?.data?.employees ?? [];
  }, [employees.isFetching]);

  const trackSearch = useCallback(
    (dimensions: string[]) => {
      track(Amp.USED_SEARCH, {
        search_term: searchTerm,
        search_dimensions: dimensions,
        org_chart_source: prefs.source,
      });
    },
    [track, searchTerm, prefs.source],
  );

  const searchResults: SearchResultItem[] = useMemo(() => {
    const orgUnitOptions = orgUnitItems.map(mapOrgUnitOption);
    if (orgUnitOptions.length)
      orgUnitOptions[0].group = t('', {
        defaultValue:
          toTranslate.orgChart.controlBar.orgUnitSearch.groups.orgUnit,
      });

    const employeeOptions = employeesItems
      // TODO: remove once the new endpoint is ready and rolled out
      // FF: FIND-4372-employee-search-using-new-entity-search
      .filter(filterEmployeesBySearchTerm(searchTerm))
      .map(mapEmployeeOption);
    if (employeeOptions.length)
      employeeOptions[0].group = t('', {
        defaultValue:
          toTranslate.orgChart.controlBar.orgUnitSearch.groups.people,
      });

    const results = [...orgUnitOptions, ...employeeOptions];

    const dimensions = [];
    if (orgUnitOptions.length) dimensions.push('OrgUnits');
    if (employeeOptions.length) dimensions.push('People');

    trackSearch(dimensions);

    return results;
  }, [orgUnitItems, t, employeesItems, searchTerm, trackSearch]);

  return {
    searchResults,
    isLoading: orgUnits.isFetching,
  };
};

export const mapOrgUnitOption = (
  orgUnit: OrgUnitItem,
): PickerOption & { group?: string } => ({
  value: `${ORG_UNIT_PREFIX}${orgUnit.id.id}`,
  label: <OptionLabel.Token label={orgUnit.name} />,
});
