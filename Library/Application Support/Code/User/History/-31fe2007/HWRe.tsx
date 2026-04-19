import { getLocale } from '@personio-web/i18n';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import {
  Table,
  TableCell,
  useTable,
  type ColumnConfig,
  type BaseData,
} from 'designSystem/component/table';
import { useMemo } from 'react';

/**
 * Shared table for previewing payroll report tables
 * - automatic pagination
 * - column visibility & reordering
 *
 * Future features:
 * - sorting
 * - filtering
 * - zoom
 * - communicate state up to keep export file columns in sync with preview
 * - keep state for each report in localStorage
 */

export type MetaValue = { currency?: string };
export type ReportValue = string | number | boolean | MetaValue;
export type ReportBaseData = {
  _meta?: MetaValue;
  [key in string]: ReportValue;
};

export type ReportTableColumn<T extends ReportBaseData> = Pick<
  ColumnConfig<T, ReportValue>,
  'id' | 'accessor' | 'enableSorting'
> & {
  header: string;
  type?: 'string' | 'date' | 'currency';
  defaultHidden?: boolean;
};

export type ReportTableData<T extends ReportBaseData> = {
  columns: ReportTableColumn<T>[];
  rows: T[];
};

export type ReportTableArgs<T extends ReportBaseData> = ReportTableData<T> & {
  isLoading?: boolean;
  title: string;
  key: string;
};

export const ReportTable = <T extends ReportBaseData>({
  rows,
  columns: rawColumns,
  isLoading,
}: ReportTableData<T> & { isLoading?: boolean }) => {
  const columnConfig = useMemo(() => {
    return rawColumns.map(mapColumnToTableColumnConfig);
  }, [rawColumns]);

  const table = useTable({
    state: {
      pagination: { pageSize: 20, pageIndex: 0 },
      hiddenColumns: rawColumns
        .filter((col) => col.defaultHidden)
        .map((col) => col.id),
    },
  });

  const paginatedRows = useMemo(() => {
    return rows.slice(
      table.pagination.pageIndex * table.pagination.pageSize,
      (table.pagination.pageIndex + 1) * table.pagination.pageSize,
    );
  }, [table.pagination, rows]);

  return (
    <>
      <Table
        table={table}
        enableColumnVisibility
        enableColumnReordering
        enableSearch
        columnConfig={columnConfig}
        data={paginatedRows}
        totalResults={rows.length}
        isLoading={isLoading ?? false}
        getRowId={(row, index: number) => String(index)}
        pinnedColumns={1}
      >
        <ControlBar>
          {/* <Controls.Sort /> */}
          {/* <Controls.Filter filterConfig={filterConfig} /> */}
          <Controls.Columns enableColumnVisibility />
          {/* <Controls.Search /> */}
        </ControlBar>
      </Table>
    </>
  );
};

const mapColumnToTableColumnConfig = <T extends ReportBaseData>(
  column: ReportTableColumn<T>,
) => {
  return {
    id: column.id,
    header: column.header,
    columnSize: 'small' as const,
    enableSorting: false, // TODO: column.isSortable ?? true,
    accessor: column.accessor,
    cell: (cell) => {
      switch (column.type) {
        case 'currency':
          return (
            <TableCell.Currency
              key={`${column.id}-${column.type}`}
              value={parseFloat(value as string)}
              locale={getLocale()}
              currency={row._meta?.currency ?? 'EUR'}
            />
          );
        case 'date': {
          return (
            <TableCell.Date
              key={`${column.id}-${column.type}`}
              locale={getLocale()}
              value={new Date(value as string)}
            />
          );
        }
        case 'string':
        default:
          return (
            <TableCell.Text
              key={`${column.id}-${column.type}`}
              value={(value as string) || ' \u2015 '}
            />
          );
      }
    },
  };
};
