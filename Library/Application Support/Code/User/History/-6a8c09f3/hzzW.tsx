import { useMemo, memo } from 'react';

import { useTranslation } from 'react-i18next';

import { useGetSearchEmployees } from '@personio-web/employees-organizations-data-search-employees';
import type { UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import {
  OptionLabel,
  type PickerOption,
  type TokenOptionLabelProps,
} from 'designSystem/component/picker';

import type { EntityNode, SearchResultItem } from '../types';

import { SEARCH_MIN_CHARACTER_LENGTH } from '../constants';

type useGetSearchResultsArgs = {
  searchTerm?: string;
  isFiltering?: boolean;
  getCompleteHierarchyNode: UseHierarchicalDataReturnType<EntityNode>['getNode'];
  getFilteredHierarchyNode?: UseHierarchicalDataReturnType<EntityNode>['getNode'];
};

export const useGetSearchResults = ({
  searchTerm,
  getCompleteHierarchyNode,
  getFilteredHierarchyNode,
  isFiltering,
}: useGetSearchResultsArgs) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.search',
  });

  const { data, isLoading } = useGetSearchEmployees({
    requestQuery: {
      query: searchTerm,
    },
    enabled: Boolean(
      searchTerm && searchTerm.length > SEARCH_MIN_CHARACTER_LENGTH,
    ),
  });

  const searchResults = useMemo(() => {
    if (isLoading) return [];

    // Retrieve people who are part of the complete hierarchy.
    const people: SearchResultItem[] =
      data?.data.employees.filter((employee) =>
        getCompleteHierarchyNode(String(employee.id)),
      ) ?? [];

    if (!people.length) return [];

    if (isFiltering && getFilteredHierarchyNode) {
      /*
       * If filtering, split people into two groups:
       * 1. `visiblePeople`: Employees that are visible in the filtered hierarchy.
       * 2. `omittedPeople`: Employees that are omitted from the filtered hierarchy.
       */
      const visiblePeople: SearchResultItem[] = [];
      const omittedPeople: SearchResultItem[] = [];

      people.forEach((employee) => {
        if (getFilteredHierarchyNode(String(employee.id))) {
          visiblePeople.push(employee);
        } else {
          omittedPeople.push(employee);
        }
      });

      // If both groups have people, return options with group titles.
      if (visiblePeople.length && omittedPeople.length) {
        const visiblePeopleOptions = visiblePeople.map(mapEmployeeOption);
        visiblePeopleOptions[0].group = t('filtered-results');

        const omittedPeopleOptions = omittedPeople.map(mapEmployeeOption);
        omittedPeopleOptions[0].group = t('more-results');

        return [...visiblePeopleOptions, ...omittedPeopleOptions];
      }
    }

    /*
     * If there is no filtering criteria or no visible/omitted distinction,
     *  return all people as options without grouping.
     */
    return people.map(mapEmployeeOption);
  }, [
    getCompleteHierarchyNode,
    getFilteredHierarchyNode,
    isFiltering,
    data?.data.employees,
    isLoading,
    t,
  ]);

  return { searchResults, isLoading };
};

const MemorizedLabel = memo<TokenOptionLabelProps>((props) => (
  <OptionLabel.Token {...props} />
));

export const mapEmployeeOption = ({
  id,
  name,
  avatar,
}: Pick<SearchResultItem, 'id' | 'name' | 'avatar'>): PickerOption & {
  group?: string;
} => ({
  value: String(id),
  label: (
    <OptionLabel.Token
      label={name}
      avatar={{
        src: avatar.startsWith('/image-service/v1/images/')
          ? avatar
          : undefined,
        name: name,
      }}
    />
  ),
});
