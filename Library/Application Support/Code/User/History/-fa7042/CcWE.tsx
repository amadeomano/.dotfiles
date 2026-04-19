import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { Table, useTable } from 'designSystem/component/table';
import { usePayrollRuns } from '../../hooks/payroll-lifecycle/usePayrollRuns';
import { usePayGroups } from '../../hooks/payroll-lifecycle/usePayGroups';
import {
  getColumnsConfig,
  getFiltersConfig,
  processor,
  useTableConfig,
} from './tableConfig';

export const PayRunsTab = () => {
  const { payrollRuns, isPayRunsFetching } = usePayrollRuns();
  const table = useTableConfig(payrollRuns?.data);

  return (
    <Table
      isLoading={isPayRunsFetching || table.isConfigLoading}
      table={table.table}
      columnConfig={table.columnsConfig}
      getRowId={({ id }) => id}
      data={table.processedData}
      // getGroups={getGroupsFn(data, payGroups?.data)}
      // getData={getGroupDataFn(data, payGroups?.data)}
      // getNextPageParam={(_lastpage, allPages) => allPages.length}
      // getPreviousPageParam={(_lastpage, allPages) => allPages.length}
    >
      <ControlBar>
        <Controls.Group />
        <Controls.Sort />
        <Controls.Filter filterConfig={table.filtersConfig} />
        <Controls.Search />
      </ControlBar>
    </Table>
  );
};
