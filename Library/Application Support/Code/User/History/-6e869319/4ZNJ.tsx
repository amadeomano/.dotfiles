import { useMemo } from 'react';

import {
  type ListOrgUnitsQueryResult,
  useListOrgUnits,
} from '@personio-web/employees-organizations-gofer';
import { OptionLabel, type PickerOption } from 'designSystem/component/picker';

import { SEARCH_MIN_CHARACTER_LENGTH } from '../../../../constants';
import { useOrgChartPreferencesContext } from '../../../../hooks';
import { type Source } from '../../../../sources/preferences/types';

type OrgUnitItem = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];
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

export const useGetOrgUnitSearchResults = ({
  searchTerm,
}: UseGetOrgUnitSearchResultsArgs): UseGetOrgUnitSearchResultsReturn => {
  const prefs = useOrgChartPreferencesContext();

  const orgUnits = useListOrgUnits({
    variables: {
      filter: `${
        orgUnitFilter[prefs.source]
      } && name.contains('${searchTerm}')`,
    },
    queryOptions: {
      enabled: (searchTerm?.length ?? 0) > SEARCH_MIN_CHARACTER_LENGTH,
    },
  });

  const orgUnitItems: OrgUnitItem[] = useMemo(() => {
    if (orgUnits.isFetching) return [];
    return orgUnits.data?.data?.orgUnits?.orgUnitsList ?? [];
  }, [orgUnits.isFetching]);

  const searchResults: SearchResultItem[] = useMemo(
    () => orgUnitItems.map(mapOrgUnitOption),
    [orgUnitItems],
  );

  return {
    searchResults,
    isLoading: orgUnits.isFetching,
  };
};

export const mapOrgUnitOption = (
  orgUnit: OrgUnitItem,
): PickerOption & { group?: string } => ({
  value: orgUnit.id.id,
  label: <OptionLabel.Token label={orgUnit.name} />,
});
