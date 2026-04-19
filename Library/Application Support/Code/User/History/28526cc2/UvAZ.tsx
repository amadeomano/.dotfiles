import { useContext, createContext, useEffect } from 'react';
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

type ListNavigatorContextData = null | {
  list: number[];
  selected: number;
  nextValue: number | null;
  prevValue: number | null;
};
const ListNavigatorContext = createContext<ListNavigatorContextData>(null);

const ListNavigator = ({ list }: { list: PayrollRun[] }) => {
  const listRef = useRef(list);
  useEffect(() => {
    if (listRef.current !== list)
      listRef.current = list;
  , [listRef.current]);

  return <ListNavigatorContext.Provider value={null} />;
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
