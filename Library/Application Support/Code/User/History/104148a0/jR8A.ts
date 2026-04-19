import { useAuthContext } from '@personio-web/auth-context';
import { type FilterConfig } from 'designSystem/component/advanced-filter';
import { useTable } from 'designSystem/component/table';
import {
  goferClient,
  useListEmploymentsByPersonIdsQuery,
} from 'employeesOrganizations/data/gofer';
import {
  type PayGroup,
  usePayGroups,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { type Employee } from '../../../hooks/usePeopleData';
import { type ColConfig } from '../tableUtils/columns';
import * as columns from '../tableUtils/columns';
import * as filters from '../tableUtils/filters';
import { getProcessedData } from '../tableUtils/dataProcessor';

export const useTableConfig = (data?: Employee[]) => {
  const table = useTable();
  const { payGroups } = usePayGroups();

  const personIds = data?.map(({ employeeId }) => employeeId.toString()) || [];
  const authContext = useAuthContext();
  const { data: personData } = useListEmploymentsByPersonIdsQuery({
    variables: { personIds, companyId: authContext.companyId },
    client: goferClient,
  });

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
