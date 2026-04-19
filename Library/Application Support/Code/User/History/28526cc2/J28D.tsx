import { Table } from 'designSystem/component/table';
import { type ListEmployerCompensationSchemasData } from '@personio-web/payroll-data-payroll-me-types';
import { ControlBar, Controls } from 'designSystem/component/control-bar';

import { type PayrollRun } from '../../../../utils/payrollRun';
import { useBuildTable } from '../../hooks/useBuildTable';
import { type EmployeeResult } from '../../../../utils/helpers';
import { useSyncEmployeeDetailsPanelList } from '../../contexts/useEmployeeDetailsPanelContext';

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
  useSyncEmployeeDetailsPanelList(processedTableData);

  const uids = processedTableData.map((row) => row.employeeId);
  const activeIdx = uids.indexOf(1234);
  const prevIdx = activeIdx > 0 ? activeIdx - 1 : null;
  const nextIdx =
    activeIdx >= 0 && activeIdx < uids.length - 1 ? activeIdx + 1 : null;

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
