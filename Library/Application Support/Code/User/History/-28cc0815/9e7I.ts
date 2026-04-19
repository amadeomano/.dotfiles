import type { HierarchicalOrgUnit } from '@personio-web/employees-organizations-data-org-units';
import type {
  GetOrgUnitQueryResult,
  ListOrgUnitsQueryResult,
  ListOrgUnitsQueryVariables,
} from '@personio-web/employees-organizations-gofer';
import type { UseListOrgUnitsParams } from '@personio-web/employees-organizations-data-org-units-types';
import type { PresetType } from '@personio-web/employees-organizations-util-org-units';
import { type HierarchicalNode } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { type UseQueryResult } from '@tanstack/react-query';

export type AdditionalQueryParams = Omit<
  UseListOrgUnitsParams,
  'filter' | 'type'
> &
  ListOrgUnitsQueryVariables;

export type UseQueryOrgUnitsSortParams = {
  by: 'name';
  order: 'ASC' | 'DESC';
};

export type UseQueryOrgUnitsParams = {
  type: PresetType;
  search?: string;
  sort?: UseQueryOrgUnitsSortParams;
  expandedOrgUnitIds?: string[] | number[];
  filterByOrgUnitIds?: string[] | number[];
  queryConfig?: {
    additionalParams?: Omit<AdditionalQueryParams, 'companyId'>;
    initialMaxDepthLoad?: number;
    autoFetchNextPage?: boolean;
    enabled?: boolean;
  };
  useLegacyId?: boolean;
};

type QueryOrgUnitsReturnType = {
  fetchNextRootPage: () => void;
  refetchRoot: () => void;
  refetchExpandedItems?: (() => void)[];
  refetchTreeTraversalItems?: (() => void)[];
  isRootError: boolean;
  isRootLoading: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
};

export type UseQueryOrgUnitsReturnType = QueryOrgUnitsReturnType & {
  orgUnits: HierarchicalOrgUnit[];
  getOrgUnit: (id: string) => HierarchicalOrgUnit | undefined;
};

export type HierarchicalOrgUnitGofer = HierarchicalNode<
  NonNullable<OrgUnitsListItem>
>;

export type UseQueryOrgUnitsGoferReturnType = QueryOrgUnitsReturnType & {
  flattenOrgUnits: OrgUnitsListItem[];
  orgUnits: HierarchicalOrgUnitGofer[];
  getOrgUnit: (id: string) => HierarchicalOrgUnitGofer | undefined;
  useLegacyId?: boolean;
};

export type GetOrgUnitGofer = GetOrgUnitQueryResult['orgUnit'];

export type ListOrgUnitsData = { data?: ListOrgUnitsQueryResult };

export type OrgUnitsListItem = NonNullable<
  NonNullable<ListOrgUnitsQueryResult['orgUnits']>['orgUnitsList']
>[number];

export type CombineQueryResultsParam = Pick<
  UseQueryResult<never>,
  'isLoading' | 'isFetching' | 'isError' | 'isSuccess'
>[];

export type CombineQueryResults = Pick<
  UseQueryOrgUnitsReturnType,
  'isLoading' | 'isFetching' | 'isError' | 'isSuccess'
>;
