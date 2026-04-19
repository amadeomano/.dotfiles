import React from 'react';

import {
  useInfiniteListOrgUnits,
  type ListOrgUnitsQueryVariables,
} from '@personio-web/employees-organizations-gofer';
import { useHierarchicalData } from '@personio-web/employees-organizations-hook-use-hierarchical-data';

import { sanitizeSearch } from '@personio-web/employees-organizations-util-org-units';
import { useAuthContext } from '@personio-web/auth-context';
import type {
  CombineQueryResults,
  CombineQueryResultsParam,
  HierarchicalOrgUnitGofer,
  OrgUnitsListItem,
  UseQueryOrgUnitsGoferReturnType,
  UseQueryOrgUnitsParams,
} from './types';
import {
  type TreeTraversalConfig,
  useListOrgUnitsByTreeTraversalGofer,
} from './useListOrgUnitsByTreeTraversalGofer';
import {
  getRootQueryParams,
  getSearchQueryParams,
} from './utils/queryParamsGofer';
import {
  getTreeTraversalFetchConfigs,
  getTreeTraversalFetchFilteredConfig,
  getTreeTraversalFetchSearchConfig,
} from './utils/getTreeTraversalFetchConfigsGofer';

const defaultQueryConfig = {
  additionalParams: {},
  initialMaxDepthLoad: 3,
  autoFetchNextPage: true,
  enabled: true,
};

const getOrgUnitId = (
  item?: OrgUnitsListItem,
  type?: 'department' | 'team',
  useLegacyId?: boolean,
) => {
  if (useLegacyId) {
    if (
      type === 'department' &&
      item?.departmentId?.__typename ===
        'protocore_hrdepartmentid_DepartmentId_v1'
    ) {
      return item?.departmentId.id;
    }

    if (
      type === 'team' &&
      item?.teamId?.__typename === 'protocore_hrteamid_TeamId_v1'
    ) {
      return item?.teamId.id;
    }
  }
  return item?.id?.id ?? '';
};

const getOrgUnitParentId = (
  item: OrgUnitsListItem,
  type: 'department' | 'team',
  useLegacyId: boolean,
) => {
  if (useLegacyId) {
    if (
      type === 'department' &&
      item?.parent?.departmentId?.__typename ===
        'protocore_hrdepartmentid_DepartmentId_v1'
    ) {
      return item?.parent?.departmentId.id;
    }

    if (
      type === 'team' &&
      item?.parent?.teamId?.__typename === 'protocore_hrteamid_TeamId_v1'
    ) {
      return item?.parent?.teamId.id;
    }
  }

  return item?.parentId?.id ?? null;
};

export const useQueryOrgUnitsGofer = ({
  type,
  search = '',
  sort,
  expandedOrgUnitIds = [],
  filterByOrgUnitIds = [],
  queryConfig = {},
  useLegacyId = false,
}: UseQueryOrgUnitsParams): UseQueryOrgUnitsGoferReturnType => {
  const { companyId } = useAuthContext();
  const enhancedAdditionalParams: ListOrgUnitsQueryVariables = {
    ...defaultQueryConfig.additionalParams,
    ...queryConfig.additionalParams,
    companyId,
  };

  const { additionalParams, autoFetchNextPage, initialMaxDepthLoad, enabled } =
    {
      ...defaultQueryConfig,
      ...queryConfig,
      additionalParams: enhancedAdditionalParams,
    };

  const [fetchExpandedConfigs, setFetchExpandedConfigs] = React.useState<
    TreeTraversalConfig[]
  >([]);

  /*
   * Fetch filtered items (root items as default)
   */
  const isSearching = Boolean(sanitizeSearch(search).length);
  const queryParams: ListOrgUnitsQueryVariables = isSearching
    ? getSearchQueryParams(
        type,
        search,
        sort,
        filterByOrgUnitIds,
        additionalParams,
      )
    : getRootQueryParams(type, sort, additionalParams);

  const { pageToken, ...restQueryParams } = queryParams;
  const {
    data: filteredData,
    fetchNextPage: fetchNextFilterPage,
    refetch: refetchRoot,
    ...filteredQueryStatus
  } = useInfiniteListOrgUnits({
    variables: {
      ...restQueryParams,
    },
    queryOptions: {
      enabled,
      getNextPageParam: (page) => {
        return page.data?.orgUnits?.nextPageToken;
      },
      onSuccess: async ({ pages }) => {
        if (!autoFetchNextPage) {
          return;
        }

        const lastResult = pages[pages.length - 1];
        const hasNextPage = lastResult.data?.orgUnits?.nextPageToken;

        if (hasNextPage) {
          await fetchNextFilterPage();
        }
      },
    },
  });

  const filteredItems = React.useMemo(() => {
    const isFiltering = Boolean(filterByOrgUnitIds.length);
    const isSearching = Boolean(sanitizeSearch(search).length);

    const items =
      filteredData?.pages.flatMap(
        (page) => page.data?.orgUnits?.orgUnitsList,
      ) ?? [];

    // Workaround because we currently only filter by root items
    if (isFiltering && !isSearching) {
      return items.filter((item) => {
        const orgUnitId = getOrgUnitId(item, type, useLegacyId);
        return (filterByOrgUnitIds as string[]).includes(String(orgUnitId));
      });
    }

    return items;
  }, [filterByOrgUnitIds, filteredData?.pages, search, useLegacyId, type]);

  /*
   * Fetch next level items by tree traversal
   */
  const treeTraversalFetchFilteredConfig = isSearching
    ? getTreeTraversalFetchSearchConfig(filteredData, queryParams)
    : getTreeTraversalFetchFilteredConfig(
        filteredData,
        queryParams,
        initialMaxDepthLoad,
      );

  const treeTraversalResults = useListOrgUnitsByTreeTraversalGofer(
    treeTraversalFetchFilteredConfig,
  );

  const treeTraversalItems = React.useMemo(
    () =>
      treeTraversalResults.flatMap(
        (result) => result?.data?.data?.orgUnits?.orgUnitsList ?? [],
      ),
    [treeTraversalResults],
  );

  const refetchTreeTraversalItems = React.useMemo(
    () => treeTraversalResults.map((result) => result.refetch),
    [treeTraversalResults],
  );

  /*
   * Fetch expanded items
   */
  const expandResults =
    useListOrgUnitsByTreeTraversalGofer(fetchExpandedConfigs);

  const expandItems = React.useMemo(
    () =>
      expandResults.flatMap(
        (result) => result.data?.data?.orgUnits?.orgUnitsList ?? [],
      ),
    [expandResults],
  );

  const refetchExpandedItems = React.useMemo(() => {
    return expandResults.map((result) => result.refetch);
  }, [expandResults]);

  const flattenOrgUnits = React.useMemo(
    () =>
      [...filteredItems, ...treeTraversalItems, ...expandItems].filter(
        (orgUnit) => orgUnit !== undefined,
      ),
    [filteredItems, treeTraversalItems, expandItems],
  );

  const { rootNodes: rootOrgUnits, getNode: getOrgUnit } =
    useHierarchicalData<OrgUnitsListItem>({
      data: flattenOrgUnits.filter(
        (item): item is NonNullable<typeof item> => item !== undefined,
      ),
      config: {
        getId: (item) => getOrgUnitId(item, type, useLegacyId),
        getChildrenCount: (item) => item?.descendants?.length ?? 0,
        getParentId: (item) => getOrgUnitParentId(item, type, useLegacyId),
      },
    });

  React.useEffect(() => {
    if (expandedOrgUnitIds?.length) {
      const expandedConfigs = getTreeTraversalFetchConfigs(
        expandedOrgUnitIds as string[],
        getOrgUnit,
        queryParams,
      );

      if (
        JSON.stringify(fetchExpandedConfigs) !== JSON.stringify(expandedConfigs)
      ) {
        setFetchExpandedConfigs(expandedConfigs);
      }
    }
  }, [expandedOrgUnitIds, fetchExpandedConfigs, getOrgUnit, queryParams]);

  const orgUnits = isSearching
    ? (filteredItems
        .map((item) => getOrgUnit(getOrgUnitId(item, type, useLegacyId)))
        .filter(Boolean) as HierarchicalOrgUnitGofer[])
    : rootOrgUnits;

  const queryStatus = combineQueryResultsStatus([
    filteredQueryStatus,
    ...treeTraversalResults,
    ...expandResults,
  ]);

  return {
    flattenOrgUnits,
    orgUnits,
    getOrgUnit,
    refetchRoot,
    refetchExpandedItems,
    refetchTreeTraversalItems,
    fetchNextRootPage: fetchNextFilterPage,
    isRootError: filteredQueryStatus.isError,
    isRootLoading: filteredQueryStatus.isLoading,
    ...queryStatus,
  };
};

function combineQueryResultsStatus(
  queryResults: CombineQueryResultsParam,
): CombineQueryResults {
  return queryResults.reduce(
    (combinedStatus, queryResult) => ({
      isLoading: queryResult.isLoading || combinedStatus.isLoading,
      isFetching: queryResult.isFetching || combinedStatus.isFetching,
      isError: queryResult.isError || combinedStatus.isError,
      isSuccess: queryResult.isSuccess || combinedStatus.isSuccess,
    }),
    {
      isLoading: false,
      isFetching: false,
      isError: false,
      isSuccess: false,
    },
  );
}
