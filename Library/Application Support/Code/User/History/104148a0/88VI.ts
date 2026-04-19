import { type FilterConfig } from 'designSystem/component/advanced-filter';
import { useTable } from 'designSystem/component/table';
import {
  type PayGroup,
  usePayGroups,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { type ColConfig } from '../tableUtils/columns';
import * as columns from '../tableUtils/columns';
import * as filters from '../tableUtils/filters';
import { getProcessedData } from '../tableUtils/dataProcessor';
import { type Employee } from '../types';

export const useTableConfig = (data?: Employee[]) => {
  const table = useTable();
  const { payGroups } = usePayGroups();

  return {
    table,
    isConfigLoading: false,
    columnsConfig: columnsConfig,
    filtersConfig: getFiltersConfig(payGroups?.data),
    processedData: getProcessedData(table, data, payGroups?.data),
  };
};

const columnsConfig: ColConfig[] = [
  columns.personColumn,
  columns.statusColumn,
  columns.payGroupColumn,
  columns.lastPaidColumn,
  columns.nextPayDayColumn,
];

type GetFiltersConfig = (payGroups?: PayGroup[]) => FilterConfig[];
const getFiltersConfig: GetFiltersConfig = (payGroups = []) => [
  filters.personFilter,
  filters.statusFilter,
  filters.payGroupFilter(payGroups),
  filters.lastPaidFilter,
  filters.nextPayDayFilter,
];
