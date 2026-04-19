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
import { usePeopleData } from '../../../hooks/usePeopleData';

export const useTableConfig = (
  peopleData: ReturnType<typeof usePeopleData>,
) => {
  const table = useTable();
  const { people, isLoading } = usePeopleData();
  const { payGroups } = usePayGroups();

  return {
    table,
    isConfigLoading: isLoading,
    columnsConfig: columnsConfig,
    filtersConfig: getFiltersConfig(payGroups?.data),
    processedData: getProcessedData(table, people, payGroups?.data),
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
