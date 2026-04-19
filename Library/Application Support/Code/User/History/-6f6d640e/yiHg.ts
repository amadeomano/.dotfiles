import type { Dispatch, SetStateAction } from 'react';

import type { ColumnFilter } from '@personio-web/design-system-component-advanced-filter-types';
import type { ComponentMetadata } from '@personio-web/design-system-utils';
import type {
  EmploymentDataFragment,
  ListPositionIdsQuery,
  ListPositionsDataQuery,
} from '@personio-web/employees-organizations-data-gofer-types';
import { type GetSearchEmployeesDataResponse } from '@personio-web/employees-organizations-data-search-employees';
import type { ExtendedHierarchicalNode } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import {
  type PersonAttribute,
  PersonSystemAttribute,
} from '@personio-web/employees-organizations-util-people';

import {
  type allowedCardSystemAttributes,
  type allowedHighlightSystemAttributes,
  type personFilterableAttribute,
  type positionFilterableAttribute,
} from './constants';
import { type GroupData } from './TreeLayout/types';

export enum OrgChartQueryParamKeys {
  ATTRIBUTES = 'attributes',
  // Renamed from cardPreferences to cardCustomizationPreferences
  // to avoid using the same localStorage key for the new card preferences logic.
  // See: https://personio.atlassian.net/browse/OS-781
  CARD_CUSTOMIZATION_PREFERENCES = 'cardCustomizationPreferences',
  FILTERS = 'filters',
  HIGHLIGHTED = 'highlighted',
  SPOTLIGHT = 'spotlight',
  SPOTLIGHT_VISIBLE_RELATIONSHIPS = 'spotlightVisible',
  SORT_BY_ATTRIBUTE = 'sortByAttribute',
  EMPLOYEE = 'employeeId',
}

export type OrgChartPreferences = {
  disabled?: boolean;

  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;

  filters: ColumnFilter[];
  setFilters: (newFilters: ColumnFilter[]) => void;

  view: View | null;
  setView: (newView: View | null) => void;

  cardPreferences: CardsPreferences;
  setCardPreferences: Dispatch<SetStateAction<CardsPreferences>>;

  attributes: PersonAttribute[];
  setAttributes: (newAttributes: PersonAttribute[]) => void;

  highlighted: PersonAttribute;
  setHighlighted: (newHighlighted: PersonAttribute) => void;

  focusedEmployeeId: string;
  setFocusedEmployeeId: (newEmployeeId: string | null) => void;

  spotlight: string;
  setSpotlight: (newSpotlight: string, from?: string) => void;

  spotlightVisibleRelationships: string[];
  setSpotlightVisibleRelationships: (
    newSpotlightVisibleRelationships: string[],
  ) => void;

  sortByAttribute: boolean;
  setSortByAttribute: Dispatch<SetStateAction<boolean>>;
};

export type AdditionalRelationshipType = 'supervisor' | 'subordinate';

export enum RelationshipTypes {
  Supervisor = 'supervisor',
  Subordinate = 'subordinate',
}

export type AdditionalRelationship = {
  attributeId: string;
  personId: string;
  type: AdditionalRelationshipType;
};

export enum NodeType {
  Person = 'person',
  UnmatchedPerson = 'unmatched-person',
  Loading = 'loading',
  Position = 'position',
  Group = 'group',
  Hidden = 'hidden',
}

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

export type HierarchyNode = ExtendedHierarchicalNode<EntityNode>;

export type CardPreferences = {
  attributeIds?: PersonAttribute[];
  highlightedAttributeId?: PersonAttribute;
  hidePersonalInfo?: boolean;
  hideAvatars?: boolean;
};

export type ReportItem = {
  total?: number;
  direct?: number;
};

export type ReportAdditionals = {
  name: string;
  countSupervisors: number;
  countReports: number;
};

export type Reports = {
  people: ReportItem;
  positions?: ReportItem;
  additionals?: ReportAdditionals[];
};

export type CardProps = {
  height: number;
  isActive: boolean;
  isIncluded?: boolean;
  isFocused: boolean;
  reports?: Reports;
  onClick: () => void;
  setSpotlight?: () => void;
};

export type HierarchyTreeNode = EntityNode & CardPreferences & CardProps;

export type GroupCardProps = GroupData & {
  height: number;
  width: number;
};

/*
 * Attributes
 */
export type EntityItem = { id: string; name?: string };

export type Attribute = {
  id: string;
  label?: string | null;
  value?: Date | EntityItem[] | string | number | boolean | null;
  isLoading?: boolean;
  isNotVisible?: boolean;
  metadata?: ComponentMetadata;
};

/*
 * Card preferences
 */
export type AllowedCardSystemAttribute =
  typeof allowedCardSystemAttributes[number];

export type CardsPreferences = {
  personalInfo: boolean;
  avatars: boolean;
  cardClustering: boolean;
  openPositions: boolean;
};

/*
 * Filter types
 */
export type PersonFilterableAttribute =
  typeof personFilterableAttribute[keyof typeof personFilterableAttribute];

export enum FilterCondition {
  Contains = 'contains',
  DoesNotContains = 'does_not_contain',
}

export type OrgChartFilter = {
  id: PersonFilterableAttribute;
  value: {
    value: string[];
    condition: FilterCondition;
  };
};

export type SearchResultItem =
  GetSearchEmployeesDataResponse['data']['data']['employees'][0];

/*
 * Highlight types
 */
export type AllowedHighlightSystemAttribute =
  typeof allowedHighlightSystemAttributes[number];

export type Highlighted = {
  attribute: AllowedHighlightSystemAttribute | undefined;
  sortByAttribute: boolean;
};

/*
 * Attribute types
 */
export type PositionData = NonNullable<
  ListPositionsDataQuery['positions']
>['items'][0];

export enum PositionAttribute {
  StartDate = PersonSystemAttribute.HireDate,
  Department = PersonSystemAttribute.Department,
  Team = PersonSystemAttribute.Team,
  Office = PersonSystemAttribute.Office,
  CostCenter = PersonSystemAttribute.CostCenter,
  JobName = PersonSystemAttribute.JobName,
  JobFamily = PersonSystemAttribute.JobFamily,
  JobLevel = PersonSystemAttribute.JobLevel,
  JobTrack = PersonSystemAttribute.JobTrack,
}

export type PositionFilterableAttribute =
  typeof positionFilterableAttribute[keyof typeof positionFilterableAttribute];

export type PositionIds = NonNullable<
  ListPositionIdsQuery['positions']
>['items'];

export type AttributeParser<TData extends object = EmploymentDataFragment> = (
  data?: TData,
  loading?: boolean,
) => Attribute;

export enum View {
  AllPeople = 'all-people',
  MyDepartment = 'my-department',
  MyTeam = 'my-team',
  MyOffice = 'my-office',
  InternalOnly = 'internal-only',
  ExternalOnly = 'external-only',
}

export enum HierarchicalRelationshipType {
  AllSupervisors = 'all-supervisors',
  Supervisor = 'supervisor',
  AllReports = 'all-reports',
  Report = 'report',
}

export type EmployeeId = number;
