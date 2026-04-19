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
  const { payGroups, isPayGroupsFetching } = usePayGroups();
  const table = useTable();
  const data = processor.getProcessedData(
    table,
    payrollRuns?.data,
    payGroups?.data,
  );
  const tbl = useTableConfig();

  return (
    <Table
      isLoading={isPayRunsFetching}
      table={tbl.table}
      columnConfig={tbl.columnsConfig}
      getRowId={({ id }) => id}
      data={data}
      // getGroups={getGroupsFn(data, payGroups?.data)}
      // getData={getGroupDataFn(data, payGroups?.data)}
      // getNextPageParam={(_lastpage, allPages) => allPages.length}
      // getPreviousPageParam={(_lastpage, allPages) => allPages.length}
    >
      <ControlBar>
        <Controls.Group />
        <Controls.Sort />
        <Controls.Filter filterConfig={tbl.filtersConfig} />
        <Controls.Search />
      </ControlBar>
    </Table>
  );
};
