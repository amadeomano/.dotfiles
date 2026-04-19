import { LayoutBleed } from 'designSystem/component/page-layout';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { Table } from 'designSystem/component/table';
import { useTableConfig } from './hooks/useTableConfig';
import { usePeopleData } from '../../hooks/usePeopleData';

export const PeopleTab = () => {
  const table = useTableConfig(people);

  return (
    <LayoutBleed side="right">
      <Table
        isLoading={table.isConfigLoading}
        table={table.table}
        columnConfig={table.columnsConfig}
        getRowId={({ employeeId }) => employeeId.toString()}
        data={table.processedData}
      >
        <ControlBar>
          <Controls.Sort />
          <Controls.Filter filterConfig={table.filtersConfig} />
          <Controls.Search />
        </ControlBar>
      </Table>
    </LayoutBleed>
  );
};
