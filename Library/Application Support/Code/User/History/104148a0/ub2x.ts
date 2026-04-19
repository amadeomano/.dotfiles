import { type FilterConfig } from 'designSystem/component/advanced-filter';
import { useTable } from 'designSystem/component/table';
import {
  type PayGroup,
  usePayGroups,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { type Employee } from '../../../hooks/usePeopleData';
import { type ColConfig } from '../tableUtils/columns';
import * as columns from '../tableUtils/columns';
import * as filters from '../tableUtils/filters';
import { getProcessedData } from '../tableUtils/dataProcessor';
import {
  type PersonColumnData,
  usePersonColumnData,
} from './usePersonColumnData';

export const useTableConfig = (data?: Employee[]) => {
  const table = useTable();
  const { payGroups } = usePayGroups();

  return {
    table,
    isConfigLoading: false,
    columnsConfig: columnsConfig(persons),
    filtersConfig: getFiltersConfig(payGroups?.data),
    processedData: getProcessedData(table, data, payGroups?.data),
  };
};

const columnsConfig = (personsData: PersonColumnData[]): ColConfig[] => [
  columns.personColumn(personsData),
  columns.statusColumn,
  columns.payGroupColumn,
  columns.lastPaidColumn,
  columns.nextPayDayColumn,
];

type GetFiltersConfig = (
  payGroups?: PayGroup[],
  personData?: PersonColumnData[],
) => FilterConfig[];
const getFiltersConfig: GetFiltersConfig = (
  payGroups = [],
  personData = [],
) => [
  filters.personFilter(personData),
  filters.statusFilter,
  filters.payGroupFilter(payGroups),
  filters.lastPaidFilter,
  filters.nextPayDayFilter,
];
