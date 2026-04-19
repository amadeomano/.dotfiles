import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';
import { type UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { type EntityNode } from '@personio-web/employees-organizations-feature-org-chart';
import { type OrgChartPreferencesState } from '../preferences/types';

type BaseHierarchyResult = {
  hierarchy: UseHierarchicalDataReturnType<EntityNode>;
  includedRootIds: string[];
  hiddenRootIds: string[];
};

type MetaData = NonNullable<ListOrgUnitsQueryResult['orgUnits']>['metadata'];

export type SupervisorHierarchyResult = BaseHierarchyResult & {
  source: 'Supervisor';
  openPositions?: Array<{
    id: string;
    publicId?: string | null;
    targetSupervisorId?: string | null;
    budgetedStartDate?: { __typename: string } | null;
    job?: { __typename: string } | null;
  }>;
};

export type OrgUnitHierarchyResult = BaseHierarchyResult & {
  source: 'Department' | 'Team';
  leadsCount?: number;
};

export type CompleteHierarchyResult =
  | SupervisorHierarchyResult
  | OrgUnitHierarchyResult;

export type QueryResult<R> = {
  data: R;
  isLoading: boolean;
  error?: unknown;
  refetch?: () => void;
};

export type FilterQueryResult = {
  hierarchy: UseHierarchicalDataReturnType<EntityNode>;
};
export type FilterQuery = (args: {
  enabled: boolean;
  completeHierarchy: CompleteHierarchyResult;
}) => QueryResult<FilterQueryResult>;

export type SpotlightResult = FilterQueryResult & {
  spotlightedLabel: string | null;
  spotlightGroups: Record<string, string> | null;
};
export type SpotlightQuery = (args: {
  enabled: boolean;
  completeHierarchy: CompleteHierarchyResult;
}) => QueryResult<SpotlightResult>;

export type SourceData = {
  isFetching: boolean;
  hasFetchErrors: boolean;
  isFiltering: boolean;
  completeHierarchyData: QueryResult<CompleteHierarchyResult>;
  displayableHierarchy: UseHierarchicalDataReturnType<EntityNode>;
  filteredHierarchy: UseHierarchicalDataReturnType<EntityNode>;
  spotlightedLabel?: string;
  spotlightGroups?: Record<string, string>;
  getInitialExpandedIds: (
    prefsState?: Partial<OrgChartPreferencesState>,
  ) => string[];
  metadata?: MetaData;
};

export type UseSourceData = (enabled: boolean) => SourceData;
