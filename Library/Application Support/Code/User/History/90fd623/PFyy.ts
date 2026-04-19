import { type NextRouter } from 'next/router';
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

type Column = keyof typeof columns.COLUMNS;
type SortFilterHandlerMap = {
  sorter: ColConfig['sortHandler'];
  filterer: HandledFilterConfig['filterHandler'];
  grouper?: ColConfig['getGroups'];
  groupDataGetter?: ColConfig['getGroupData'];
};
type ColumnSorterMap = { [K in Column]: SortFilterHandlerMap };
const columnSorterMap: (
  payGroups: PayGroup[],
  router: NextRouter,
) => ColumnSorterMap = (payGroups, router) => ({
  title: {
    sorter: columns.titleColumn(router, payGroups).sortHandler,
    filterer: filters.titleFilter.filterHandler,
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
  router: NextRouter,
  table: UseTableReturnType,
  data?: PayrollRun[],
  payGroups: PayGroup[] = [],
): PayrollRun[] => {
  if (!data) return [];
  const processedData = [...data];

  const sorting = table.sorting.sorting;
  if (sorting)
    processedData.sort(
      columnSorterMap(payGroups, router)[sorting.id as Column].sorter(
        sorting.desc,
      ),
    );

  return table.filters.filters.reduce(
    (acc, { id, value }) =>
      acc.filter(
        columnSorterMap(payGroups, router)[id as Column].filterer(value),
      ),
    processedData,
  );
};

export const getGroupsFn =
  (
    router: NextRouter,
    data: PayrollRun[] = [],
    payGroups: PayGroup[] = [],
  ): FetchGroups =>
  (groupArgs) => {
    const grouperFn = columnSorterMap(payGroups, router)[
      groupArgs.groupId as Column
    ]?.grouper;

    if (grouperFn) return Promise.resolve(grouperFn(data, groupArgs));
    else return Promise.reject('Grouper not implemented');
  };

// TODO: remove type once DS's FetchData type bug is resolved and it's not anymore any
type FetchData = TableProps<PayrollRun, unknown>['getData'];
export const getGroupDataFn =
  (data: PayrollRun[] = [], payGroups: PayGroup[] = []): FetchData =>
  (groupArgs) => {
    const result = groupArgs.groups.reduce((acc, group) => {
      const filterer =
        columnSorterMap(payGroups)[group.id as Column]?.groupDataGetter;
      if (filterer) return acc.filter(filterer(group));
      else return acc;
    }, data);
    return Promise.resolve({ total: result.length, records: result });
  };
