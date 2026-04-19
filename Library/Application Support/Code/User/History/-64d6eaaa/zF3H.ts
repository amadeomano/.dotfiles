import { useTable } from 'designSystem/component/table';
import { type FilterConfig } from 'designSystem/component/advanced-filter';
import {
  type PayGroup,
  usePayGroups,
} from '../../hooks/payroll-lifecycle/usePayGroups';
import { type PayrollRun } from '../../hooks/payroll-lifecycle/usePayrollRuns';
import { type ColConfig } from './tableUtils/columns';
import * as columns from './tableUtils/columns';
import * as filters from './tableUtils/filters';
import {
  getProcessedData,
  getGroupsFn,
  getGroupDataFn,
} from './tableUtils/dataProcessor';
export * as processor from './tableUtils/dataProcessor';

export const useTableConfig = (data?: PayrollRun[]) => {
  const table = useTable();
  // const router = useRouter();
  const { payGroups, isPayGroupsFetching } = usePayGroups();

  return {
    table,
    isConfigLoading: isPayGroupsFetching,
    columnsConfig: getColumnsConfig(payGroups?.data),
    filtersConfig: getFiltersConfig(payGroups?.data),
    processedData: getProcessedData(table, data, payGroups?.data),
    getGroups: getGroupsFn(data, payGroups?.data),
    getGroupData: getGroupDataFn(data, payGroups?.data),
  };
};

type GetColsConfig = (payGroups?: PayGroup[]) => ColConfig[];
export const getColumnsConfig: GetColsConfig = (payGroups = []) => [
  columns.titleColumn(payGroups),
  columns.peopleColumn,
  columns.scheduleColumn(payGroups),
  columns.statusColumn,
  columns.approvedOnColumn,
  columns.taxPeriodColumn,
  columns.taxYearColumn,
];

type GetFiltersConfig = (payGroups?: PayGroup[]) => FilterConfig[];
export const getFiltersConfig: GetFiltersConfig = (payGroups = []) => [
  filters.titleFilter,
  filters.peopleFilter,
  filters.scheduleFilter(payGroups),
  filters.statusFilter,
  filters.approvedOnFilter,
  filters.taxPeriodFilter,
  filters.taxYearFilter,
];
