import { useCallback } from 'react';
import { useAuthContext } from '@personio-web/auth-context';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';

import { useOrgChartPreferencesContext } from '../../../contexts/useOrgChartPreferences';
import { type UseSourceData } from '../types';
import { type OrgChartPreferencesState } from '../../preferences/types';
import { NodeMap } from '../../../Nodes/constants';
import { useCompleteHierarchy } from './useCompleteHierarchy';
import { useFilteredHierarchy } from './useFilteredHierarchy';

export const useOrgUnit: UseSourceData = (enabled) => {
  const prefs = useOrgChartPreferencesContext();
  const completeHierarchyData = useCompleteHierarchy({ enabled });

  // TODO: remove once [DQL-684] is resolved
  const { companyId } = useAuthContext();
  const permissionData = useListOrgUnits({
    variables: {
      companyId,
      pageSize: 1,
      filter: `type == 'department'`,
      includeAccessRights: true,
    },
    queryOptions: { enabled },
  });
  // END TODO

  const filteredHierarchyData = useFilteredHierarchy({
    enabled,
    completeHierarchyData,
  });
  const filteredHierarchy = filteredHierarchyData.data.hierarchy;
  const isFiltering = prefs.filters.length > 0;

  const displayableHierarchy = isFiltering
    ? filteredHierarchy
    : completeHierarchyData.data.hierarchy;

  const isFetching =
    completeHierarchyData.isLoading || filteredHierarchyData.isLoading;

  const hasFetchErrors = Boolean(
    completeHierarchyData.error || filteredHierarchyData.error,
  );

  const getInitialExpandedIds = useCallback(
    (prefsState?: Partial<OrgChartPreferencesState>) => {
      if (completeHierarchyData.isLoading || filteredHierarchyData.isLoading)
        return [];

      const currentPrefs = { ...prefs, ...prefsState };

      if (currentPrefs.activeCardId) {
        const expandedIds =
          displayableHierarchy
            .getNode(currentPrefs.activeCardId)
            ?.ancestors.map((node) => node.id) ?? [];

        return expandedIds;
      }

      if (isFiltering)
        return displayableHierarchy.nodes
          .filter((node) => node.data.type === NodeMap.UnmatchedOrgUnit)
          .map((node) => node.id);

      return [];
    },
    [completeHierarchyData, filteredHierarchyData, prefs.activeCardId],
  );

  return {
    isFetching,
    hasFetchErrors,
    isFiltering,
    completeHierarchyData,
    displayableHierarchy,
    filteredHierarchy,
    spotlightedLabel: undefined,
    spotlightGroups: undefined,
    getInitialExpandedIds,
    metadata: permissionData.data?.data?.orgUnits?.metadata,
  };
};
