import React, { MouseEvent, ReactNode, RefObject } from 'react';
import {
  GetNextPageParamFunction,
  GetPreviousPageParamFunction,
} from 'react-query';
import type {
  AccessorFn as TanstackAccessorFn,
  Cell as TanstackCell,
  ColumnFilter as TanstackColumnFilter,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSort as TanstackColumnSort,
  HeaderContext,
  PaginationState as TanstackPaginationState,
  Row as TanstackRow,
  Table as TanstackTable,
  TableOptions as TanstackTableOptions,
} from '@tanstack/react-table';

import { type CurrencyCode } from '@personio-web/currency';
import { type Locale } from '@personio-web/i18n';

import type { ComponentMetadata } from '@personio-web/design-system-utils';
import type { BulkActionsConfig } from '@personio-web/design-system-component-bulk-actions';
import type { ButtonProps } from '@personio-web/design-system-component-button-types';
import type { CheckboxProps } from '@personio-web/design-system-component-checkbox-types';
import type { EmptyStateProps } from '@personio-web/design-system-component-empty-state';
import type { EnumProps } from '@personio-web/design-system-component-enum-types';
import type { IconSVGComponent } from '@personio-web/design-system-component-icon-types';
import type { LinkProps } from '@personio-web/design-system-component-link-types';
import type { MenuItemProps } from '@personio-web/design-system-component-menu-item-types';
import { SwitchProps } from '@personio-web/design-system-component-switch-types';
import type { TokenProps } from '@personio-web/design-system-component-token-types';
import type { TooltipProps } from '@personio-web/design-system-component-tooltip-types';
import type { GroupBy } from '@personio-web/design-system-component-control-bar-types';

export type SortingOrder = 'desc' | 'asc';

export type ColumnSize = 'small' | 'medium' | 'large';

export type PageType = 'pagination' | 'infinite';

export type PinnedColumns = 1 | 2 | 3;

export type FilterFieldType =
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'number';

export type FilterCondition =
  | 'contains'
  | 'does_not_contain'
  | 'equals'
  | 'does_not_equal'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_on'
  | 'is_before'
  | 'is_on_or_before'
  | 'is_after'
  | 'is_on_or_after'
  | 'is_within_range'
  | 'is_outside_of_range'
  | 'is_less_than'
  | 'is_less_than_or_equal'
  | 'is_greater_than'
  | 'is_greater_than_or_equal';

// ===============================
// Misc
// ===============================
// TODO: ALLOW GENERICS HERE
export type SearchParams = {
  sortingId?: string;
  // TODO: SYNC THIS WITH REACT-TABLE
  sortingOrder?: SortingOrder;
  pageSize: number;
  pageIndex: number;
  filters?: Record<string, unknown>;
  search: string;
  hiddenColumns: string[];
};

export type GroupSearchParams = {
  groups: Grouping[];
} & SearchParams;

export interface PaginatedResponse<T> {
  records: T[];
  total: number;
}

// =========================
// React useTable hook props
// =========================
export interface ColumnFilter extends TanstackColumnFilter {
  id: string;
  value: {
    value: unknown;
    condition: unknown;
  };
}

export type Grouping = {
  id: string;
  label: string;
  value: string;
  uniqueId: string;
};

export type SortType = 'asc' | 'desc';

interface TableParams {
  selectedRows?: string[];
  expandedRows?: string[] | true;
  hiddenColumns?: string[];
  order?: ColumnOrderState;
  pinning?: ColumnPinningState;
  search?: string;
  pagination?: TanstackPaginationState;
  sorting?: TanstackColumnSort;
  filters?: ColumnFilter[];
  groups?: GroupBy[];
}

export interface UseTableParams {
  state?: TableParams;

  onTableStateChange?(
    state: Omit<TableParams, 'hiddenColumns' | 'selectedRows'>,
  ): void;
}

// =========================
// General types
// =========================
export interface BaseData {
  [key: string]: unknown;
}

// =========================
// Filters and Columns
// =========================
export type FilterOption = {
  id: string;
  value: string;
  label: string;
};

export interface ColumnMetaType<T, U>
  extends Pick<ColumnConfig<T, U>, 'icon' | 'header' | 'frozen' | 'footer'> {
  filter?: FilterConfig<T>;
}

export type ColumnId<T> = T extends BaseData ? Extract<keyof T, string> : never;

export interface BaseFilterConfig<T> {
  columnId: ColumnId<T>;
  options?: FilterOption[];
}

// TODO: @jordan: use Extract to keep types in sync with FilterCondition
export type TextFilterConditions = Array<
  | 'contains'
  | 'does_not_contain'
  | 'equals'
  | 'does_not_equal'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
>;

export type SelectFilterConditions = Array<
  'contains' | 'does_not_contain' | 'is_empty' | 'is_not_empty'
>;

export type DateFilterConditions = Array<
  | 'is_on'
  | 'is_before'
  | 'is_on_or_before'
  | 'is_after'
  | 'is_on_or_after'
  | 'is_within_range'
  | 'is_outside_of_range'
  | 'is_empty'
  | 'is_not_empty'
>;

export type NumberFilterConditions = Array<
  | 'equals'
  | 'is_less_than'
  | 'is_less_than_or_equal'
  | 'is_greater_than'
  | 'is_greater_than_or_equal'
  | 'is_within_range'
>;

export interface TextFilterConfig<T> extends BaseFilterConfig<T> {
  field: 'text';
  conditions?: TextFilterConditions;
}

export interface SelectFilterConfig<T> extends BaseFilterConfig<T> {
  field: 'select' | 'multiselect';
  conditions?: SelectFilterConditions;
}

export interface DateFilterConfig<T> extends BaseFilterConfig<T> {
  field: 'date';
  conditions?: DateFilterConditions;
}

export interface NumberFilterConfig<T> extends BaseFilterConfig<T> {
  field: 'number';
  conditions?: NumberFilterConditions;
}

export type FilterConfig<T> =
  | TextFilterConfig<T>
  | SelectFilterConfig<T>
  | DateFilterConfig<T>
  | NumberFilterConfig<T>;

export interface ColumnConfig<T, U> {
  id: string;
  header?: string;
  accessor: TanstackAccessorFn<T, U>;
  cell: (props: { row: T; employeeId: U }) => JSX.Element;
  columnSize?: ColumnSize;
  icon?: IconSVGComponent;
  frozen?: boolean;
  enableSorting?: boolean;
  enableGrouping?: boolean;
  footer?: string | JSX.Element;
}

export type Separator = {
  type: 'separator';
};

export type RowAction<T> = Omit<
  MenuItemProps,
  'active' | 'endIcon' | 'startIcon' | 'variant'
> & {
  id: string;
  icon?: IconSVGComponent;
  metadata?: ComponentMetadata;
  name: string;
  onSelect?: (event: any, data: { row: TanstackRow<T> }) => void;
  isEnabled?: (data: { row: TanstackRow<T> }) => boolean;
  subItems?: RowAction<T>[] | Separator[];
  type: 'item';
  variant?: 'default' | 'destructive';
};

export type RowActionConfig<T> = RowAction<T> | Separator;

export type PrimaryActionConfig = Pick<
  ButtonProps,
  'disabled' | 'icon' | 'loading' | 'metadata' | 'onClick'
> & {
  label: ButtonProps['children'];
  iconOnly?: boolean;
};

export interface ActionConfig {
  primary: PrimaryActionConfig;
}

// =============================
// UseTableReturnType hook props
// =============================
export interface UseTableColumnVisibilityReturnType {
  hiddenColumns: string[];
  updaters: {
    replace: React.Dispatch<React.SetStateAction<string[]>>;
    showAll: React.Dispatch<React.SetStateAction<void>>;
  };
}

export interface UseTableColumnOrderReturnType {
  order: ColumnOrderState;
  updaters: {
    replace: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
  };
}

export interface UseTableColumnPinningReturnType {
  pinning: ColumnPinningState;
  updaters: {
    replace: React.Dispatch<React.SetStateAction<ColumnPinningState>>;
  };
}

export interface UseTableFiltersReturnType {
  filters: ColumnFilter[];
  updaters: {
    replaceFilters: React.Dispatch<
      React.SetStateAction<TanstackColumnFilter[]>
    >;
    clear: React.Dispatch<React.SetStateAction<void>>;
  };
}

export interface UseTablePaginationReturnType {
  pageSize: number;
  pageIndex: number;
  updaters: {
    setPagination: React.Dispatch<
      React.SetStateAction<TanstackPaginationState>
    >;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
  };
}

export interface UseTableSearchReturnType {
  term: string;
  updaters: {
    replace: React.Dispatch<React.SetStateAction<string>>;
    clear: React.Dispatch<React.SetStateAction<void>>;
  };
}

export interface UseTableSortingReturnType {
  sorting: TanstackColumnSort | undefined;
  updaters: {
    replace: React.Dispatch<
      React.SetStateAction<TanstackColumnSort | undefined>
    >;
  };
}

export interface UseTableSelectionReturnType {
  rows: string[];
  updaters: {
    replace: React.Dispatch<React.SetStateAction<string[]>>;
    clear: React.Dispatch<React.SetStateAction<void>>;
  };
}

export interface UseTableExpansionReturnType {
  expanded: string[] | true;
  updaters: {
    replace: React.Dispatch<React.SetStateAction<string[] | true>>;
    clear: React.Dispatch<React.SetStateAction<void>>;
  };
}

export interface UseTableGroupReturnType {
  groups: GroupBy[];
  updaters: {
    replace: React.Dispatch<React.SetStateAction<GroupBy[]>>;
  };
}

export interface UseTableReturnType {
  selection: UseTableSelectionReturnType;
  expansion: UseTableExpansionReturnType;
  columnVisibility: UseTableColumnVisibilityReturnType;
  order: UseTableColumnOrderReturnType;
  pinning: UseTableColumnPinningReturnType;
  sorting: UseTableSortingReturnType;
  search: UseTableSearchReturnType;
  pagination: UseTablePaginationReturnType;
  filters: UseTableFiltersReturnType;
  groupings: UseTableGroupReturnType;
}

export type useTableType = { (params?: UseTableParams): UseTableReturnType };

// ===============================
// UseReactTableConfigParams props
// ===============================

type InheritedTableProps<T> = Required<
  Pick<TanstackTableOptions<T>, 'getRowId' | 'data'>
> &
  Pick<TanstackTableOptions<T>, 'getSubRows' | 'enableExpanding'>;

export interface UseReactTableConfigParams<T extends BaseData, U>
  extends InheritedTableProps<T> {
  table: UseTableReturnType;
  isLoading: boolean;
  isError?: boolean;
  actionConfig?: ActionConfig;
  columnConfig: ColumnConfig<T, U>[];
  filterConfig?: FilterConfig<T>[];
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnReordering?: boolean;
  className?: string;
  totalResults?: number;
  frozenColumnId?: string;
  metadata?: ComponentMetadata;
  rowActionsConfig?: RowActionConfig<T>[];
  pinnedColumns?: PinnedColumns;
  bulkActionsConfig?: BulkActionsConfig[];
}

export type mapTableToSearchParamsFn = {
  (table: UseTableReturnType): SearchParams;
};

// ===============================
// Table component props
// ===============================

export interface TableErrorStates {
  noDataAvailableYet?: Partial<EmptyStateProps>;
  failedToFetchData?: Partial<EmptyStateProps>;
  zeroFilteredResults?: Partial<EmptyStateProps>;
  zeroSearchResults?: Partial<EmptyStateProps>;
  errorBoundary?: Partial<EmptyStateProps>;
  customError?: EmptyStateProps;
}

export interface TableErrorStateProps {
  isTableEmpty?: boolean;
  hasFiltersSet?: boolean;
  hasSearchQuerySet?: boolean;
  hasTableError?: boolean;
  resetFilters?: () => void;
  resetSearch?: () => void;
  isError?: boolean;
  errorConfig?: TableErrorStates;
}

export type FetchData<T extends BaseData> = (
  params: GroupSearchParams,
) => Promise<PaginatedResponse<T>>;

export type FetchGroups = ({
  groupId,
  filters,
}: {
  groupId: string;
  filters: Grouping[];
}) => Promise<Grouping[]>;

// TODO: Both T and U should be optional since they can't be provided always.
interface TableComponentProps<T extends BaseData, U>
  extends UseReactTableConfigParams<T, U> {
  children?: ReactNode;
  onCellClick?: ({
    value,
    cell,
    event,
  }: {
    value: T;
    cell: TanstackCell<BaseData, T>;
    event: MouseEvent<HTMLTableDataCellElement>;
  }) => void;
  onRowClick?: ({
    row,
    cells,
  }: {
    row: TanstackRow<BaseData>;
    cells: TanstackCell<BaseData, T> & { value: string }[];
  }) => void;
  onRowDetailToggle?: (row: TanstackRow<BaseData>) => void;
  highlightedRowId?: string;
  isError?: boolean;
  errorConfig?: TableErrorStates;
  isLoading: boolean;
  spaceBetween?: boolean;
  /** @deprecated use pinnedColumns prop */
  frozenColumnId?: string;
  pinnedColumns?: PinnedColumns;
  hideColumnHeaders?: boolean;
  pageType?: PageType;

  /** Search props */
  enableSearch?: boolean;
  searchDebounceTime?: number;

  /** Infinite list props */
  onLoadMore?: () => void;
  onLoadPrevious?: () => Promise<unknown> | undefined;
  /* Add this if the table's vertical scroll element is different */
  containerRef?: RefObject<HTMLElement>;
  /* Required for sticky header behavior */
  stickyHeaderRef?: RefObject<HTMLElement>;
  hasNextPage?: boolean;

  /** Component metadata */
  metadata?: ComponentMetadata;

  /** grouping data fetching props **/
  // method to fetch data for a specific group
  getData?: FetchData<T>;
  // method to fetch groups
  getGroups?: FetchGroups;
  // method to get the next page when fetching group data
  getNextPageParam?: GetNextPageParamFunction;
  // method to get the previous page when fetching group data
  getPreviousPageParam?: GetPreviousPageParamFunction;
}

// TODO: @jordan: can we go back to what we had before? i.e. Without type alias
export type TableComponent = <T extends BaseData, U>(
  props: TableComponentProps<T, U>,
) => JSX.Element;

export type TableProps<T extends BaseData, U> = TableComponentProps<T, U>;

// ===============================
// TableCell component props
// ===============================

type Some<T> = T;
type None = null | undefined;
type Maybe<T> = Some<T> | None;

interface BaseCellProps<T> {
  value: Maybe<T>;

  /** Table Cell metadata */
  metadata?: ComponentMetadata;
}

export interface DefaultCellProps extends BaseCellProps<ReactNode> {
  align?: 'left' | 'right';
  truncate?: boolean;
}

export interface TextCell<T> extends BaseCellProps<T> {
  tooltip?: { variant?: 'info' | 'warning' } & Pick<
    TooltipProps,
    'content' | 'side'
  >;
}

export interface TextCellProps extends TextCell<string> {
  icon?: IconSVGComponent;
}

export interface DateCellProps extends TextCell<Date> {
  locale: Locale;
  dateFormat?: string;
}

export interface NumberCellProps extends TextCell<number> {}

export interface CurrencyCellProps extends TextCell<number> {
  locale: Locale;
  currency: CurrencyCode;
}

export interface PercentageCellProps extends TextCell<number> {
  decimals?: number;
}

export interface ChipCellProps extends BaseCellProps<string> {
  avatar?: string;
}

export interface ButtonCellProps extends BaseCellProps<string> {
  onClick: ButtonProps['onClick'];
  icon?: ButtonProps['icon'];
  iconOnly?: boolean;
  variant?: Extract<ButtonProps['variant'], 'default' | 'ghost'>;
  loading?: ButtonProps['loading'];
  disabled?: ButtonProps['disabled'];
}

export interface TokenCellProps extends BaseCellProps<string> {
  avatar?: TokenProps['avatar'];
  href?: TokenProps['href'];
  renderHoverCard?: (props: { children: React.ReactNode }) => React.JSX.Element;
  disabled?: boolean;
}

export interface EnumCellProps extends BaseCellProps<string> {
  color?: EnumProps['color'];
  icon?: EnumProps['icon'];
  onClick?: EnumProps['onClick'];
  disabled?: EnumProps['disabled'];
  tooltip?: EnumProps['tooltip'];
}

type LinkCellPropsExtends = Omit<LinkProps, 'children' | 'metadata'> &
  TextCell<string>;

export interface LinkCellProps extends LinkCellPropsExtends {
  value: string;
}

export interface CheckboxCellProps
  extends BaseCellProps<CheckboxProps['checked']> {
  value: CheckboxProps['checked'];
  label: CheckboxProps['aria-label'];
  onCheckedChange?: CheckboxProps['onCheckedChange'];
  showUnchecked?: boolean;
}

export interface CustomCellProps extends BaseCellProps<string> {
  className?: string;
}

export interface SwitchCellProps extends BaseCellProps<boolean> {
  value: SwitchProps['checked'];
  label: SwitchProps['label'];
  onCheckedChange?: SwitchProps['onCheckedChange'];
  disabled?: SwitchProps['disabled'];
}

export type TableCellType = {
  Text: { (props: TextCellProps): JSX.Element | null };
  Checkbox: { (props: CheckboxCellProps): JSX.Element | null };
  Date: { (props: DateCellProps): JSX.Element };
  Number: { (props: NumberCellProps): JSX.Element };
  Currency: { (props: CurrencyCellProps): JSX.Element };
  Percent: { (props: PercentageCellProps): JSX.Element };
  Chip: { (props: ChipCellProps): JSX.Element };
  Link: { (props: LinkCellProps): JSX.Element };
  Button: { (props: ButtonCellProps): JSX.Element };
  Switch: { (props: SwitchCellProps): JSX.Element };
  Token: { (props: TokenCellProps): JSX.Element };
  Enum: { (props: EnumCellProps): JSX.Element };
  Custom: { (props: CustomCellProps): JSX.Element };
};

export type TableHeaderCellContentProps<T, U> = {
  isSortable: boolean;
  enableColumnVisibility?: boolean;
  prop: HeaderContext<T, U>;
  icon?: IconSVGComponent;
  header?: string;
};

export interface TablePaginationProps<T> {
  className?: string;
  table: TanstackTable<T>;
}
