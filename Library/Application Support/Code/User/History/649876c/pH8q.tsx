import { LayoutBleed } from 'designSystem/component/page-layout';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { Table } from 'designSystem/component/table';
import { usePayrollRuns } from '../../hooks/payroll-lifecycle/usePayrollRuns';
import { useTableConfig } from './hooks/useTableConfig';
import { usePeopleData } from '../../hooks/usePeopleData';

export const PeopleTab = () => {
  const { people } = usePeopleData();
  const table = useTableConfig(people);

  return (
    <LayoutBleed side="right">
      <Table
        isLoading={table.isConfigLoading}
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
    </LayoutBleed>
  );
};
