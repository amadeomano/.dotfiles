import type {
  FilterConfig,
  ColumnFilter,
} from 'designSystem/component/advanced-filter';
import {
  type PayGroup,
  frequencyOptions,
  getPayGroupById,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { COLUMNS } from './columns';
import {
  predicateByStr,
  predicateByNum,
  predicateByDate,
  predicateBySelect,
} from './filterUtils';
import { type Employee } from '../types';

type Opt<T> = { id: T; value: string };
export type HandledFilterConfig = FilterConfig & {
  filterHandler: (
    colFilter: ColumnFilter['value'],
  ) => (predicate: Employee) => boolean;
};

export const personFilter: HandledFilterConfig = {
  columnId: COLUMNS.person,
  field: 'text',
  conditions: ['contains'],
  filterHandler:
    (filter) =>
    ({ employeeId }) =>
      predicateByNum(employeeId, filter),
};

type StatusOptions = { [Status in Employee['status']]: Opt<Status> };
const statusOptions: StatusOptions = {
  NEW: { id: 'NEW', value: 'New' },
  ACTIVE: { id: 'ACTIVE', value: 'Active' },
  INACTIVE: { id: 'INACTIVE', value: 'Inactive' },
  EXCLUDED: { id: 'EXCLUDED', value: 'Excluded' },
  LEAVING: { id: 'LEAVING', value: 'Leaving' },
};
export const statusFilter: HandledFilterConfig = {
  columnId: COLUMNS.status,
  field: 'select',
  conditions: ['equals'],
  options: Object.values(statusOptions),
  filterHandler:
    (filter) =>
    ({ status }) =>
      predicateBySelect(status, filter),
};

export const payGroupFilter: (payGroups: PayGroup[]) => HandledFilterConfig = (
  payGroups,
) => ({
  columnId: COLUMNS.payGroup,
  field: 'select',
  conditions: ['equals'],
  options: frequencyOptions.getOptions(),
  filterHandler:
    (filter) =>
    ({ payGroupId }) =>
      predicateBySelect(
        getPayGroupById(payGroups, payGroupId)?.frequency ?? '',
        filter,
      ),
});

export const lastPaidFilter: HandledFilterConfig = {
  columnId: COLUMNS.lastPaid,
  field: 'date',
  conditions: ['is_on'],
  filterHandler:
    (filter) =>
    ({ approvedDate }) =>
      approvedDate ? predicateByDate(approvedDate, filter) : false,
};

export const taxPeriodFilter: HandledFilterConfig = {
  columnId: COLUMNS.taxPeriod,
  field: 'number',
  conditions: [
    'equals',
    'is_less_than_or_equal',
    'is_greater_than_or_equal',
    'is_within_range',
  ],
  filterHandler:
    (filter) =>
    ({ period }) =>
      predicateByNum(period, filter),
};

export const taxYearFilter: HandledFilterConfig = {
  columnId: COLUMNS.taxYear,
  field: 'text',
  conditions: ['contains'],
  filterHandler: (filter) => (run) =>
    predicateByStr(taxYearColumn.accessor(run, 0) as string, filter),
};
