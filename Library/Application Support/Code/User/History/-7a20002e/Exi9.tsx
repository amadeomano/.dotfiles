import { type ListEmployerCompensationSchemasData } from 'payroll/data/payroll-me';
import {
  TableCell,
  useTable,
  type UseTableReturnType,
  type ColumnConfig,
} from 'designSystem/component/table';
import { icons } from 'designSystem/component/icon';

import { getNumericValue, type EmployeeResult } from '../../../utils/helpers';
import {
  type PayrollRun,
  payrollRunEmployeeFullname,
} from '../../../utils/payrollRun';
import {
  sortByNum,
  sortByStr,
} from '../../../tabs/PayRunsTab/tableUtils/sortUtils';
import {
  CurrencyCell,
  getCompensationColums,
  getCompensationsColumns,
} from '../components/EmployeesTable/tableUtils/tableColumns';

export const useBuildTable = (
  payRunData: PayrollRun | undefined,
  compensationSchemas: ListEmployerCompensationSchemasData['data'] | undefined,
) => {
  type Column = keyof typeof COLUMNS;
  type ColConfig = ColumnConfig<EmployeeResult, unknown> & {
    sortHandler: (
      desc?: boolean,
    ) => (a: EmployeeResult, b: EmployeeResult) => number;
  };
  type SortFilterHandlerMap = {
    sorter: ColConfig['sortHandler'];
  };
  type ColumnSorterMap = { [K in Column]: SortFilterHandlerMap };

  const table = useTable();
  const compensationDescriptions =
    compensationSchemas?.map((compensation) => compensation.description) || [];

  const STATIC_COLUMNS = {
    person: 'person',
    grossPay: 'grossPay',
    netPay: 'netPay',
  };

  const COMPENSATIONS_COLUMNS = getCompensationsColumns(
    compensationDescriptions,
  );

  const COLUMNS = {
    ...STATIC_COLUMNS,
    ...COMPENSATIONS_COLUMNS,
  };

  const tableColumns: ColConfig[] = [
    {
      id: COLUMNS.person,
      header: 'Person',
      accessor: (emp: EmployeeResult) =>
        payrollRunEmployeeFullname(emp.employee),
      cell: ({ value, row }) => {
        const name = value as string;
        return <TableCell.Token avatar={{ name }} value={name} />;
      },
      columnSize: 'medium',
      icon: icons.personCircle,
      enableSorting: true,
      sortHandler: (desc) => (a: EmployeeResult, b: EmployeeResult) =>
        sortByStr(
          payrollRunEmployeeFullname(a.employee),
          payrollRunEmployeeFullname(b.employee),
          desc,
        ),
    },
    {
      id: COLUMNS.grossPay,
      header: 'Gross pay',
      accessor: (row: EmployeeResult) => String(row.payslip?.grossPay ?? ''),
      cell: CurrencyCell,
      columnSize: 'small',
      icon: icons.moneyBag,
      sortHandler: (desc) => (a: EmployeeResult, b: EmployeeResult) =>
        sortByNum(
          getNumericValue(a?.payslip?.grossPay || ''),
          getNumericValue(b.payslip?.grossPay || ''),
          desc,
        ),
    },
    {
      id: COLUMNS.netPay,
      header: 'Net pay',
      accessor: (row: EmployeeResult) => String(row.payslip?.netPay ?? ''),
      cell: CurrencyCell,
      columnSize: 'small',
      icon: icons.moneyBag,
      sortHandler: (desc) => (a: EmployeeResult, b: EmployeeResult) =>
        sortByNum(
          getNumericValue(a.payslip?.netPay || ''),
          getNumericValue(b.payslip?.netPay || ''),
          desc,
        ),
    },
    ...getCompensationColums(compensationDescriptions),
  ];

  const getColumn = (columnName: string) =>
    tableColumns.find((column) => column.id === columnName);

  const columnSorterMap: ColumnSorterMap = Object.keys(COLUMNS).reduce(
    (accum, column) => {
      return {
        ...accum,
        ...{
          [column]: {
            sorter: getColumn(COLUMNS[column as Column])?.sortHandler,
          },
        },
      };
    },
    {} as ColumnSorterMap,
  );

  const getProcessedTableData = (
    table: UseTableReturnType,
    data: PayrollRun['employeeResults'] | undefined,
    columnSorterMap: ColumnSorterMap,
  ): PayrollRun['employeeResults'] => {
    if (!data) return [];
    const processedData = [...data];

    const sorting = table.sorting.sorting;

    if (sorting) {
      return processedData.sort(
        columnSorterMap[sorting.id as Column]?.sorter(sorting.desc),
      );
    }

    return data || [];
  };

  return {
    table,
    tableColumns,
    processedTableData: getProcessedTableData(
      table,
      payRunData?.employeeResults,
      columnSorterMap,
    ),
    getProcessedTableData,
  };
};
