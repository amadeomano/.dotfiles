import { Table } from 'designSystem/component/table';
import { type ListEmployerCompensationSchemasData } from '@personio-web/payroll-data-payroll-me-types';
import { ControlBar, Controls } from 'designSystem/component/control-bar';

import { type PayrollRun } from '../../../../utils/payrollRun';
import { useBuildTable } from '../../hooks/useBuildTable';
import { type EmployeeResult } from '../../../../utils/helpers';

type EmployeesTableProps = {
  payRun: PayrollRun | undefined;
  compensationSchemas: ListEmployerCompensationSchemasData['data'] | undefined;
  isLoading: boolean;
};

export const EmployeesTable = ({
  payRun,
  isLoading,
  compensationSchemas,
}: EmployeesTableProps) => {
  const { table, processedTableData, tableColumns } = useBuildTable(
    payRun,
    compensationSchemas,
  );
  const uids = processedTableData.map((row) => row.employeeId);

  return (
    <Table
      enableColumnVisibility
      table={table}
      getRowId={(row: EmployeeResult) => String(row.employeeId)}
      columnConfig={tableColumns}
      isLoading={isLoading}
      data={processedTableData}
    >
      <ControlBar>
        <Controls.Sort />
      </ControlBar>
    </Table>
  );
};
