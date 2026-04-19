import uniqWith from 'lodash/uniqWith';
import { v4 as uuidv4 } from 'uuid';
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
  groupFilterer?: ColConfig['groupFilterHandler'];
};
type ColumnSorterMap = { [K in Column]: SortFilterHandlerMap };
const columnSorterMap: (payGroups: PayGroup[]) => ColumnSorterMap = (
  payGroups,
) => ({
  title: {
    sorter: columns.titleColumn.sortHandler,
    filterer: filters.titleFilter.filterHandler,
  },
  people: {
    sorter: columns.peopleColumn.sortHandler,
    filterer: filters.peopleFilter.filterHandler,
    grouper: (data, { groupId, sort }) => {
      const groups = uniqWith(
        data,
        (a, b) => a.employeeResults.length === b.employeeResults.length,
      );
      groups.sort(columns.peopleColumn.sortHandler(sort === 'desc'));
      return groups.map((run) => ({
        uniqueId: uuidv4(),
        id: groupId,
        label: columns.peopleColumn.header ?? '',
        value: columns.peopleColumn.accessor(run, 0) as string,
      }));
    },
    groupFilterer:
      ({ value }) =>
      (run) =>
        columns.peopleColumn.accessor(run, 0) === value,
  },
  schedule: {
    sorter: columns.scheduleColumn(payGroups).sortHandler,
    filterer: filters.scheduleFilter(payGroups).filterHandler,
    grouper: columns.scheduleColumn(payGroups).getGroups,
    groupFilterer: columns.scheduleColumn(payGroups).groupFilterHandler,
  },
  status: {
    sorter: columns.statusColumn.sortHandler,
    filterer: filters.statusFilter.filterHandler,
    grouper: columns.statusColumn.getGroups,
    groupFilterer: columns.statusColumn.groupFilterHandler,
  },
  approvedOn: {
    sorter: columns.approvedOnColumn.sortHandler,
    filterer: filters.approvedOnFilter.filterHandler,
  },
  taxPeriod: {
    sorter: columns.taxPeriodColumn.sortHandler,
    filterer: filters.taxPeriodFilter.filterHandler,
    grouper: columns.taxPeriodColumn.getGroups,
    groupFilterer: columns.taxPeriodColumn.groupFilterHandler,
  },
  taxYear: {
    sorter: columns.taxYearColumn.sortHandler,
    filterer: filters.taxYearFilter.filterHandler,
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

export const getGroupsFn =
  (data: PayrollRun[] = [], payGroups: PayGroup[] = []): FetchGroups =>
  (groupArgs) => {
    const grouperFn =
      columnSorterMap(payGroups)[groupArgs.groupId as Column].grouper;

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
        columnSorterMap(payGroups)[group.id as Column].groupFilterer;
      if (filterer) return acc.filter(filterer(group));
      else return acc;
    }, data);
    return Promise.resolve({ total: result.length, records: result });
  };
