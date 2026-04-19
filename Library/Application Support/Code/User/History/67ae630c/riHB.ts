import {
  type UseTableReturnType,
  type FetchGroups,
  type TableProps,
} from 'designSystem/component/table';
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
  people: {
    sorter: columns.peopleColumn.sortHandler,
    filterer: filters.peopleFilter.filterHandler,
  },
  schedule: {
    sorter: columns.scheduleColumn(payGroups).sortHandler,
    filterer: filters.scheduleFilter(payGroups).filterHandler,
    grouper: columns.scheduleColumn(payGroups).getGroups,
    groupDataGetter: columns.scheduleColumn(payGroups).getGroupData,
  },
  status: {
    sorter: columns.statusColumn.sortHandler,
    filterer: filters.statusFilter.filterHandler,
    grouper: columns.statusColumn.getGroups,
    groupDataGetter: columns.statusColumn.getGroupData,
  },
  approvedOn: {
    sorter: columns.approvedOnColumn.sortHandler,
    filterer: filters.approvedOnFilter.filterHandler,
  },
  taxPeriod: {
    sorter: columns.taxPeriodColumn.sortHandler,
    filterer: filters.taxPeriodFilter.filterHandler,
    grouper: columns.taxPeriodColumn.getGroups,
    groupDataGetter: columns.taxPeriodColumn.getGroupData,
  },
  taxYear: {
    sorter: columns.taxYearColumn.sortHandler,
    filterer: filters.taxYearFilter.filterHandler,
    grouper: columns.taxYearColumn.getGroups,
    groupDataGetter: columns.taxYearColumn.getGroupData,
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
