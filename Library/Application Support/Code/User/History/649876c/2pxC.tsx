import { useState } from 'react';
import { LayoutBleed } from 'designSystem/component/page-layout';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { Table } from 'designSystem/component/table';
import { useTableConfig } from './hooks/useTableConfig';
import { usePeopleData } from '../../hooks/usePeopleData';
import { type BulkAction, bulkActionsConfig } from './tableUtils/bulkActions';
import { AssignPayrollGroupDialog } from './components/AssignPayrollGroupDialog/AssignPayrollGroupDialog';

export const PeopleTab = () => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(true);

  const peopleData = usePeopleData();
  const table = useTableConfig(peopleData);

  const handleBulkAction = (action: BulkAction, selectedRows: string[]) => {
    setSelectedEmployeeIds(selectedRows);
    if (action === 'ADD_TO_GROUP') setIsAssignOpen(true);
  };

  return (
    <>
      <LayoutBleed side="right">
        <Table
          bulkActionsConfig={bulkActionsConfig(handleBulkAction)}
          isLoading={table.isConfigLoading}
          table={table.table}
          columnConfig={table.columnsConfig}
          getRowId={({ employeeId }) => employeeId.toString()}
          data={table.processedData}
          enableRowSelection
        >
          <ControlBar>
            <Controls.Columns enableColumnReordering enableColumnVisibility />
            <Controls.Sort />
            <Controls.Filter filterConfig={table.filtersConfig} />
            <Controls.Search />
          </ControlBar>
        </Table>
      </LayoutBleed>
      {isAssignOpen && (
        <AssignPayrollGroupDialog
          onClose={() => setIsAssignOpen(false)}
          employeeIds={selectedEmployeeIds}
        />
      )}
    </>
  );
};
