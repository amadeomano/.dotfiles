import { PageModal } from 'designSystem/component/page';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { Table } from 'designSystem/component/table';
import { PayRollRunDetailsModal } from '../../features/PayRollRunDetailsModal/PayRollRunDetailsModal';
import { usePayrollRuns } from '../../hooks/payroll-lifecycle/usePayrollRuns';
import { usePayRunNavigator } from '../../hooks/navigators/usePayRunNavigator';
import { useTableConfig } from './useTableConfig';

export const PayRunsTab = () => {
  const { payrollRuns, isPayRunsFetching } = usePayrollRuns();
  const table = useTableConfig(payrollRuns?.data);

  const { getActivePayRun } = usePayRunNavigator();
  const activeRun = getActivePayRun();

  return (
    <>
      <Table
        isLoading={isPayRunsFetching || table.isConfigLoading}
        table={table.table}
        columnConfig={table.columnsConfig}
        getRowId={({ id }) => id}
        data={table.processedData}
        getGroups={table.getGroups}
        getData={table.getGroupData}
        getNextPageParam={(_lastpage, allPages) => allPages.length}
        getPreviousPageParam={(_lastpage, allPages) => allPages.length}
      >
        <ControlBar>
          <Controls.Group />
          <Controls.Sort />
          <Controls.Filter filterConfig={table.filtersConfig} />
          <Controls.Search />
        </ControlBar>
      </Table>
      {activeRun && <PayRollRunDetailsModal runId={activeRun} />}
      <PageModal></PageModal>
    </>
  );
};
