import { type UseTableReturnType } from 'designSystem/component/table';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { type PayGroup } from '../../../hooks/payroll-lifecycle/usePayGroups';
import type { ColConfig } from './columns';
import type { HandledFilterConfig } from './filters';
import * as columns from './columns';
import * as filters from './filters';
import { type Employee } from '../types';

type Column = keyof typeof columns.COLUMNS;
type SortFilterHandlerMap = {
  sorter: ColConfig['sortHandler'];
  filterer: HandledFilterConfig['filterHandler'];
};
type ColumnSorterMap = { [K in Column]: SortFilterHandlerMap };
const columnSorterMap: (payGroups: PayGroup[]) => ColumnSorterMap = (
  payGroups,
) => ({
  person: {
    sorter: columns.personColumn.sortHandler,
    filterer: filters.personFilter.filterHandler,
  },
  status: {
    sorter: columns.statusColumn.sortHandler,
    filterer: filters.statusFilter.filterHandler,
  },
  payGroup: {
    sorter: columns.payGroupColumn.sortHandler,
    filterer: filters.payGroupFilter(payGroups).filterHandler,
  },
  lastPaid: {
    sorter: columns.lastPaidColumn.sortHandler,
    filterer: filters.lastPaidFilter.filterHandler,
  },
  nextPayDay: {
    sorter: columns.nextPayDayColumn.sortHandler,
    filterer: filters.nextPayDayFilter.filterHandler,
  },
});

export const getProcessedData = (
  table: UseTableReturnType,
  data?: PayrollRun[],
  payGroups: PayGroup[] = [],
): PayrollRun[] => {
  if (!data) return [];
  const processedData = [...data];

  const sorting = table.sorting.sorting;
  if (sorting)
    processedData.sort(
      columnSorterMap(payGroups)[sorting.id as Column].sorter(sorting.desc),
    );

  return table.filters.filters.reduce(
    (acc, { id, value }) =>
      acc.filter(columnSorterMap(payGroups)[id as Column].filterer(value)),
    processedData,
  );
};
