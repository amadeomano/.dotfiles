import React, { useRef } from 'react';
import { type Column } from '@tanstack/react-table';
import classNames from 'classnames';
import { v4 as uuidV4 } from 'uuid';

import { createSlots } from '@personio-web/design-system-utils';
import { BulkActions } from '@personio-web/design-system-component-bulk-actions';
import {
  type TableContextProps,
  ControlBar,
} from '@personio-web/design-system-component-control-bar';
import { type IconSVGComponent } from '@personio-web/design-system-component-icon-types';
import { Stack } from '@personio-web/design-system-component-layout';
import { SavedViews } from '@personio-web/design-system-component-saved-views';
import type {
  BaseData,
  PinnedColumns,
  SortType,
  TableProps,
} from '@personio-web/design-system-component-table';

import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
import {
  ROW_ACTIONS_COLUMN,
  SELECTION_COLUMN,
} from './hooks/useReactTableColumns';
import { TableContent } from './TableContent/TableContent';
import { useGroupedSelectedRows } from './TableGroup/hooks/useGroupedSelectedRows';
import { TableGroup } from './TableGroup/TableGroup';
import { useReactTableConfig } from './hooks';
import { TableErrorState } from './shared';

import styles from './Table.module.scss';

const Table = <T extends BaseData, U>(props: TableProps<T, U>) => {
  const {
    className,
    pageType = 'pagination',
    isLoading,
    columnConfig,
    frozenColumnId,
    enableExpanding,
    metadata,
    containerRef,
    stickyHeaderRef,
    rowActionsConfig,
    bulkActionsConfig,
    children,
    getData,
    getGroups,
    getNextPageParam,
    getPreviousPageParam,
    bulkActionsPosition = 'sticky',
    ...restProps
  } = props;

  const {
    table: { filters, groupings, columnVisibility },
    enableColumnVisibility,
    enableColumnReordering,
    enableColumnResizing,
    spaceBetween,
  } = restProps;
  const enableRowSelection =
    restProps.enableRowSelection || !!bulkActionsConfig;

  // forcefully disable column resizing when the following props are passed
  // * spaceBetween
  // * pinnedColumns (where pinnedColumns > 1)
  // * frozenColumnId
  // see: https://github.com/TanStack/table/discussions/3813
  // and... https://github.com/TanStack/table/issues/5392
  const shouldPreventColumnResizing =
    !!spaceBetween ||
    !!frozenColumnId ||
    (restProps.pinnedColumns && restProps.pinnedColumns > 1);

  const canResizeColumns =
    !shouldPreventColumnResizing && !!enableColumnResizing;

  const table = useReactTableConfig({
    frozenColumnId,
    ...restProps,
    columnConfig,
    isLoading,
    enableExpanding,
    metadata,
    rowActionsConfig,
    enableRowSelection,
  });

  const { groupedRowsSelectionState, setGroupedRowsSelectionState } =
    useGroupedSelectedRows<T>(groupings.groups, table);

  const TABLE_CHILDREN_ERROR_MESSAGE =
    'Table only supports children of type ControlBar';

  const { slots, rest: unmatchedComponents } = createSlots(children, {
    controlBar: ControlBar,
    savedViewsSideRail: SavedViews.Siderail,
  });

  if (unmatchedComponents.length > 0) {
    throw new Error(TABLE_CHILDREN_ERROR_MESSAGE);
  }

  // Header is sticky if page type is infinite and containerRef is
  // not passed in, e.g. table vertically scrolls within itself
  // OR if a stickyHeaderRef is specified
  const isHeaderSticky =
    (pageType === 'infinite' && !containerRef) ||
    typeof stickyHeaderRef !== 'undefined';

  // TODO: Remove next lines after frozenColumnId is not used anymore and start using pinnedColumns directly from props
  const leftPinnedColumns = table.getLeftLeafColumns();
  const pinnedColumnsFallback = leftPinnedColumns.filter(
    (column) => ![SELECTION_COLUMN, ROW_ACTIONS_COLUMN].includes(column.id),
  ).length as PinnedColumns;
  const pinnedColumns = useRef<PinnedColumns>(
    restProps.pinnedColumns || pinnedColumnsFallback,
  );

  const allLeafColumns = table.getAllLeafColumns();
  const allColumns = table.getAllColumns();

  const sortableColumns = React.useMemo(
    () =>
      allColumns
        .map((col) => (col.getCanSort() ? col : undefined))
        .filter(Boolean),
    [allColumns],
  ) as Column<T>[];

  const groupableColumns = React.useMemo(
    () =>
      columnConfig
        .filter((col) => col.enableGrouping)
        .map((col) => ({
          id: col.id,
          label: col.header as string,
          sort: 'asc' as SortType,
          uniqueId: uuidV4(),
          icon: col.icon,
        })),
    [columnConfig],
  );

  const handleResetSort = React.useCallback(
    () => table.resetSorting(true),
    [table],
  );

  // This means that scrolling vertically will only scroll within the table
  // element, and not within whatever container (e.g. page shell) in which the
  // table is inserted
  const verticalScrollWithinTable = pageType === 'infinite' && !containerRef;

  const sortOptions = React.useMemo(
    () =>
      sortableColumns.map((opt) => ({
        ...opt,
        value: opt.id,
        label: opt.columnDef.meta?.header as string,
        icon: opt.columnDef.meta?.icon as IconSVGComponent,
      })),
    [sortableColumns],
  );

  const controlBarProps: TableContextProps = {
    columns: {
      columns: allLeafColumns as unknown as Column<BaseData>[],
      visibleColumns: allLeafColumns.length,
      ...(enableColumnVisibility && { enableColumnVisibility }),
      ...(enableColumnReordering && { enableColumnReordering }),
      columnOrder: table.getState().columnOrder,
      setColumnOrder: table.setColumnOrder,
      pinnedColumns: pinnedColumns.current,
      columnConfig,
      hasHiddenColumns: columnVisibility.hiddenColumns.length > 0,
      updateHiddenColumns: columnVisibility.updaters.replace,
    },
    filter: {
      filters: filters.filters,
      columnConfig,
      onChange: (arg) => {
        table.setColumnFilters((old) => {
          console.log('[]', { old });
          return arg;
        });
      },
    },
    group: {
      groups: groupableColumns,
      selectedGroups: groupings.groups,
      onChange: groupings.updaters.replace,
    },
    search: {
      value: table.getState().globalFilter,
      onTextChange: table.setGlobalFilter,
      searchDebounceTime: restProps.searchDebounceTime,
    },
    sort: {
      value: table.getState().sorting?.[0],
      options: sortOptions,
      resetSorting: handleResetSort,
    },
  };

  const hasGrouping = groupings.groups.length > 0;

  const groupedRows = Object.values(groupedRowsSelectionState).flat();
  const hasGroupedRows = Boolean(groupedRows.length > 0);

  const selectedRows = Object.keys(table.getState().rowSelection);
  const hasBulkActions =
    bulkActionsConfig &&
    (table.getIsSomeRowsSelected() ||
      table.getIsAllRowsSelected() ||
      hasGroupedRows);

  // TODO: Had to fork the component since the saved views overflow hidden is messing with the
  // rowActions negative margins. Please help to fix this or wait till new row actions is implemented.
  if (slots.savedViewsSideRail) {
    return (
      <>
        {hasGrouping ? (
          <Stack space="gap-large">
            {slots.controlBar &&
              React.cloneElement(slots.controlBar, {
                table: controlBarProps,
              })}
            <div className={styles.savedViewsGrid}>
              <div>{slots.savedViewsSideRail}</div>
              <div className={styles.groupTablePadding}>
                <div>
                  <TableGroup
                    groupings={groupings.groups}
                    depth={0}
                    getData={getData}
                    getGroups={getGroups}
                    columnConfig={columnConfig}
                    getNextPageParam={getNextPageParam}
                    getPreviousPageParam={getPreviousPageParam}
                    rowActionsConfig={rowActionsConfig}
                    enableColumnResizing={canResizeColumns}
                    setSelectionState={setGroupedRowsSelectionState}
                    {...restProps}
                  />
                </div>
              </div>
            </div>
          </Stack>
        ) : (
          <Stack
            space="gap-large"
            className={classNames(className, styles.tableStack, {
              // If page type is infinite but no container is specified, use this as
              // vertical scroll container. In practice this may result
              // in 2 scrollbars - one for the outer container and one within the table
              [styles.withVerticalScroll]: verticalScrollWithinTable,
            })}
            metadata={{ sticky: String(isHeaderSticky), ...metadata }}
          >
            {slots.controlBar &&
              React.cloneElement(slots.controlBar, {
                table: controlBarProps,
              })}

            <div className={styles.savedViewsGrid}>
              <div>{slots.savedViewsSideRail}</div>
              <Stack space="gap-large" className={styles.tablePadding}>
                <TableContent
                  {...props}
                  enableColumnResizing={canResizeColumns}
                  isLoading={isLoading}
                  columnConfig={columnConfig}
                />
              </Stack>
            </div>
          </Stack>
        )}

        {hasBulkActions && (
          <div
            className={classNames(styles.withBulkActions, {
              [styles.fixedBulkActions]: bulkActionsPosition === 'fixed',
            })}
          >
            <BulkActions
              config={bulkActionsConfig}
              items={hasGroupedRows ? groupedRows : selectedRows}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {hasGrouping ? (
        <Stack space="gap-large">
          {slots.controlBar &&
            React.cloneElement(slots.controlBar, {
              table: controlBarProps,
            })}
          <div>
            <TableGroup
              groupings={groupings.groups}
              depth={0}
              getData={getData}
              getGroups={getGroups}
              columnConfig={columnConfig}
              getNextPageParam={getNextPageParam}
              getPreviousPageParam={getPreviousPageParam}
              rowActionsConfig={rowActionsConfig}
              enableColumnResizing={canResizeColumns}
              setSelectionState={setGroupedRowsSelectionState}
              {...restProps}
            />
          </div>
        </Stack>
      ) : (
        <Stack
          space="gap-large"
          className={classNames(className, styles.tableStack, {
            // If page type is infinite but no container is specified, use this as
            // vertical scroll container. In practice this may result
            // in 2 scrollbars - one for the outer container and one within the table
            [styles.withVerticalScroll]: verticalScrollWithinTable,
          })}
          metadata={{ sticky: String(isHeaderSticky), ...metadata }}
        >
          {slots.controlBar &&
            React.cloneElement(slots.controlBar, {
              table: controlBarProps,
            })}

          <TableContent
            {...props}
            enableColumnResizing={canResizeColumns}
            isLoading={isLoading}
            columnConfig={columnConfig}
            pinnedColumns={pinnedColumns.current}
          />
        </Stack>
      )}

      {hasBulkActions && (
        <div
          className={classNames(styles.withBulkActions, {
            [styles.fixedBulkActions]: bulkActionsPosition === 'fixed',
          })}
        >
          <BulkActions
            config={bulkActionsConfig}
            items={hasGroupedRows ? groupedRows : selectedRows}
          />
        </div>
      )}
    </>
  );
};

const TableWithErrorBoundary = <T extends BaseData, U>(
  props: TableProps<T, U>,
) => (
  <ErrorBoundary FallbackComponent={<TableErrorState hasTableError />}>
    <Table {...props} />
  </ErrorBoundary>
);

export { TableWithErrorBoundary as Table };
