import { useMemo } from 'react';
import {
  type ColumnFiltersState,
  type ColumnSizingState,
  type ColumnSort,
  type Table,
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type {
  BaseData,
  UseReactTableConfigParams,
} from '@personio-web/design-system-component-table';

import {
  getColumnPinningUpdate,
  getDefaultColumnPinningState,
  mapSelectionArrayToObject,
} from '../utils';
import { useReactTableColumns } from './useReactTableColumns';

export const useReactTableConfig = <T extends BaseData, U>({
  table: {
    selection,
    expansion,
    pagination,
    columnVisibility,
    sorting,
    search,
    filters,
    order,
    pinning,
    columnSizing,
  },
  metadata,
  totalResults,
  enableExpanding,
  enableRowSelection,
  enableColumnVisibility,
  enableColumnResizing,
  frozenColumnId,
  rowActionsConfig,
  pinnedColumns,
  columnConfig,
  ...params
}: UseReactTableConfigParams<T, U>): Table<T> => {
  const hiddenColumns = useMemo(
    () =>
      mapSelectionArrayToObject(columnVisibility?.hiddenColumns ?? [], false),
    [columnVisibility?.hiddenColumns],
  );

  const columns = useReactTableColumns(
    columnConfig,
    {
      metadata,
      enableRowSelection,
      enableExpanding,
      enableColumnVisibility,
    },
    rowActionsConfig,
  );

  const visibleColumns = useMemo(
    () => columns.filter((col) => !(col?.id && col?.id in hiddenColumns)),
    [columns, columnVisibility.hiddenColumns],
  );

  const rowSelection = mapSelectionArrayToObject(selection?.rows ?? [], true);
  const expanded =
    typeof expansion?.expanded === 'boolean'
      ? expansion.expanded
      : mapSelectionArrayToObject(expansion?.expanded ?? [], true);
  const sortedColumns = sorting.sorting ? [sorting.sorting] : [];

  const columnOrder = order.order.length
    ? order.order
    : visibleColumns.map((column) => String(column.id));

  const hasRowActions = Boolean(rowActionsConfig?.length);

  const columnPinning = pinning.pinning.left
    ? pinning.pinning
    : getDefaultColumnPinningState({
        columnOrder,
        frozenColumnId,
        pinnedColumns,
        enableRowSelection,
        hasRowActions,
      });

  const allColumnsNotResizable = visibleColumns.every(
    (c) => c.enableResizing === false,
  );

  // when resizing is enabled, forcefully disable it if
  // every column in the config disallows resizing
  const shouldEnableColumnResizing =
    !!enableColumnResizing && !allColumnsNotResizable;

  const table = useReactTable<T>({
    data: params.data,
    columns: visibleColumns,
    state: {
      sorting: sortedColumns,
      columnVisibility: hiddenColumns,
      rowSelection,
      expanded,
      globalFilter: search.term,
      columnFilters: filters.filters,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      columnOrder,
      columnPinning,
      columnSizing: columnSizing.columnSizing,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: false,
    // TODO: enable specifying whether column is sortable in column config
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    columnResizeMode: 'onChange',
    enableColumnResizing: shouldEnableColumnResizing,
    enableRowSelection,
    enableExpanding,
    enableMultiRowSelection: enableRowSelection,
    pageCount: totalResults ? Math.ceil(totalResults / pagination.pageSize) : 1,
    // using this field would be preferable but it can't be done due to this bug: https://github.com/TanStack/table/issues/3900
    // autoResetPageIndex: true,
    onPaginationChange: (updater) => {
      const value = functionalUpdate(updater, {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      pagination.updaters?.setPagination(value);
    },
    onRowSelectionChange: (updater) => {
      const value = functionalUpdate<Record<string, boolean>>(
        updater,
        rowSelection,
      );
      selection?.updaters?.replace(Object.keys(value));
    },
    onExpandedChange: (updater) => {
      const value = functionalUpdate<true | Record<string, boolean>>(
        updater,
        expanded,
      );
      expansion?.updaters?.replace(Object.keys(value));
    },
    enableHiding: enableColumnVisibility,
    onColumnVisibilityChange: (updater) => {
      const value = functionalUpdate<Record<string, boolean>>(
        updater,
        hiddenColumns,
      );
      const newHiddenColumns = Object.entries(value)
        .filter(([_, hidden]) => !hidden)
        .map(([column]) => column);
      columnVisibility?.updaters?.replace(newHiddenColumns);

      const newColumnPinning = getColumnPinningUpdate({
        pinnedColumns: columnPinning.left || [],
        hiddenColumns: newHiddenColumns,
        enableRowSelection,
        hasRowActions,
      });

      pinning.updaters.replace(newColumnPinning);
    },
    onSortingChange: (updater) => {
      const value = functionalUpdate<ColumnSort[]>(updater, sortedColumns);
      sorting?.updaters?.replace(value.length > 0 ? value[0] : undefined);
      pagination.updaters?.setPageIndex(0);
    },
    onGlobalFilterChange: (updater) => {
      const value = functionalUpdate<string>(updater, search.term);
      search?.updaters?.replace(value);
      pagination.updaters?.setPageIndex(0);
    },
    enableFilters: true,
    enableColumnFilters: true,
    onColumnFiltersChange: (updater) => {
      updater();
      const value = functionalUpdate<ColumnFiltersState>(
        updater,
        filters.filters,
      );
      filters.updaters.replaceFilters(value);
      pagination.updaters?.setPageIndex(0);
    },
    onColumnSizingChange: (updater) => {
      const value = functionalUpdate<ColumnSizingState>(
        updater,
        columnSizing.columnSizing,
      );
      columnSizing.updaters.replace(value);
    },
    getRowId: params.getRowId,
    getSubRows: params.getSubRows,
    onColumnOrderChange: (updater) => {
      const value = functionalUpdate(updater, order.order);
      order.updaters.replace(value);

      const hasRowActions = Boolean(rowActionsConfig?.length);

      const newColumnPinning = getColumnPinningUpdate({
        pinnedColumns: value.slice(0, columnPinning.left?.length) || [],
        hiddenColumns: columnVisibility.hiddenColumns,
        enableRowSelection,
        hasRowActions,
      });

      pinning.updaters.replace(newColumnPinning);
    },
    onColumnPinningChange: (updater) => {
      const value = functionalUpdate(updater, pinning.pinning);
      pinning.updaters.replace(value);
    },
  });
  return table;
};
