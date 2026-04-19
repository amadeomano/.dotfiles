import { type UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data-types';
import { type ColumnFilter } from 'designSystem/component/advanced-filter';
import {
  type LayoutQueryResult,
  type BaseQueryVariables,
} from './layout.types';
import { type OrgChartPreferences } from './preferences.type';

export type NodeType =
  | 'person'
  | 'unmatched-person'
  | 'loading'
  | 'position'
  | 'group'
  | 'hidden'
  | 'org-unit'
  | 'unmatched-org-unit';

export type RelationshipType = 'child' | 'parent';

export type GroupData = {
  id: string;
  relatedNodeId?: string;
  relationshipType?: RelationshipType;
};

export type EntityNode = {
  /*
   * Node id
   */
  id: string;
  // TODO: refactor type to use camelCase to be consistent with the rest of the types
  /*
   * ID of the parent node
   */
  parent_id: string | null;
  /*
   * ID of entity the node represents
   */
  entity_id: string;
  /*
   * Hidden flag
   */
  hidden?: boolean;
  /*
   * ID of group the node belongs to
   */
  group?: GroupData;
  /*
   * Entity type the node represents
   */
  type: NodeType;
};

export type PersonCompleteHierarchyVariables = BaseQueryVariables<{
  includeOpenPositions?: boolean;
  skip?: boolean;
}>;

type BaseHierarchyResult = {
  hierarchy: UseHierarchicalDataReturnType<EntityNode>;
  includedRootIds: string[];
  hiddenRootIds: string[];
};

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

export type PersonCompleteHierarchyResult =
  | SupervisorHierarchyResult
  | OrgUnitHierarchyResult;

export type CompleteHierarchyResult = PersonCompleteHierarchyResult;

export type UsePersonCompleteHierarchyQuery = (
  variables?: PersonCompleteHierarchyVariables,
) => LayoutQueryResult<PersonCompleteHierarchyResult>;

export type PersonDisplayableHierarchyResult = {
  hierarchy: UseHierarchicalDataReturnType<EntityNode>;
};

export type UsePersonDisplayableHierarchyQuery = (variables: {
  preferences: OrgChartPreferences;
  completeHierarchy: PersonCompleteHierarchyResult;
}) => LayoutQueryResult<PersonDisplayableHierarchyResult>;

export type UseListFilteredIdsQuery = (options: {
  filters: ColumnFilter[];
  skip?: boolean;
}) => LayoutQueryResult<{
  matchedIds?: string[];
  totalSize?: number | null;
}>;

export type OrgChartFeature = React.FC;
export type OtherPeopleDrawerFeature = React.FC;
