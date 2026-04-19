import { icons } from 'designSystem/component/icon';
import {
  type ColumnSize,
  Table,
  TableCell,
  useTable,
} from 'designSystem/component/table';

import {
  type PayrollRun,
  payrollRunEmployeeFullname,
} from '../../../../utils/payrollRun';
import {
  getNumericValue,
  type EmployeeResult,
} from '../../../../utils/helpers';
import { type ListEmployerCompensationSchemasData } from '@personio-web/payroll-data-payroll-me-types';

type EmployeesTableProps = {
  payRun: PayrollRun | undefined;
  compensationSchemas: ListEmployerCompensationSchemasData['data'] | undefined;
  isLoading: boolean;
};

const getCompensationItemData = (
  payslip: EmployeeResult['payslip'],
  description: string,
): string => {
  return (
    [
      ...(payslip?.deductions || []),
      ...(payslip?.contributions || []),
      ...(payslip?.payments || []),
    ].find((item) => item.description === description)?.amount || ''
  );
};

export const EmployeesTable = ({
  payRun,
  isLoading,
  compensationSchemas,
}: EmployeesTableProps) => {
  const table = useTable({ state: { filters: [] } });
  const compensationDescriptions =
    compensationSchemas?.map((compensation) => compensation.description) || [];

  return (
    <Table
      enableColumnVisibility
      table={table}
      getRowId={(row) => String(row.employeeId)}
      columnConfig={[
        {
          id: 'employee',
          header: 'Person',
          accessor: (emp) => payrollRunEmployeeFullname(emp.employee),
          cell: ({ value: name }) => {
            return <TableCell.Token avatar={{ name }} value={name} />;
          },
          columnSize: 'medium',
          icon: icons.personCircle,
        },
        {
          id: 'grossPay',
          header: 'Gross pay',
          accessor: (row) => String(row.payslip?.grossPay ?? ''),
          cell: ({ value }) => {
            return (
              <TableCell.Currency
                value={getNumericValue(value)}
                currency={'GBP'}
                locale={'en-GB'}
                {...(getNumericValue(value) === 0 && {
                  tooltip: {
                    content: 'Empty value',
                    variant: 'warning',
                  },
                })}
              />
            );
          },
          columnSize: 'small',
          icon: icons.moneyBag,
        },
        {
          id: 'netPay',
          header: 'Net pay',
          accessor: (row) => String(row.payslip?.netPay ?? ''),
          cell: ({ value }) => {
            return (
              <TableCell.Currency
                value={getNumericValue(value)}
                currency={'GBP'}
                locale={'en-GB'}
                {...(getNumericValue(value) === 0 && {
                  tooltip: {
                    content: 'Empty value',
                    variant: 'warning',
                  },
                })}
              />
            );
          },
          columnSize: 'small',
          icon: icons.moneyBag,
        },
        ...compensationDescriptions.map((compensation) => ({
          id: compensation,
          header: compensation,
          columnSize: 'small' as ColumnSize,
          accessor: ({ payslip }: EmployeeResult) =>
            getCompensationItemData(payslip, compensation),
          cell: ({ value }: { value: string }) => {
            return (
              <TableCell.Currency
                value={getNumericValue(value)}
                currency={'GBP'}
                locale={'en-GB'}
                {...(getNumericValue(value) === 0 && {
                  tooltip: {
                    content: 'Empty value',
                    variant: 'warning',
                  },
                })}
              />
            );
          },
          icon: icons.coinStack,
        })),
      ]}
      isLoading={isLoading}
      data={payRun?.employeeResults ?? []}
    />
  );
};
