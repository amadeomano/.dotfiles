import {
  ColumnConfig,
  Table,
  useTable,
  BaseData,
} from 'designSystem/component/table';
import { Stack } from 'designSystem/component/layout';
import {
  EmployeeChangesRow,
  EmployeeChangesRowWithAttribute,
} from '../../../../../components/BasicEmployeeSidepanel/types';

type EmployeeDataTableProps<T extends BaseData> = {
  columnConfig: ColumnConfig<T, T[keyof T]>[];
  isLoading: boolean;
  data: T[] | undefined;
  title: string;
};

export function EmployeeDataTable<T extends BaseData>({
  columnConfig,
  isLoading,
  data,
  title,
}: EmployeeDataTableProps<T>) {
  const table = useTable({ state: { filters: [] } });

  const handleGetRowId = (row: EmployeeChangesRow) => {
    return (
      (row as EmployeeChangesRowWithAttribute).attribute ??
      'generic-absence-row'
    );
  };

  if (!data || data.length === 0) return null;
  return (
    <Stack space="gap-small">
      <h4>{title}</h4>
      <Table
        table={table}
        columnConfig={columnConfig}
        data={data || []}
        getRowId={handleGetRowId}
        isLoading={isLoading}
      />
    </Stack>
  );
}
