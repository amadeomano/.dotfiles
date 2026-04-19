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
    ({ lastPayDate }) =>
      lastPayDate ? predicateByDate(lastPayDate, filter) : false,
};

export const nextPayDayFilter: HandledFilterConfig = {
  columnId: COLUMNS.nextPayDay,
  field: 'date',
  conditions: ['is_on'],
  filterHandler:
    (filter) =>
    ({ nextPayDate }) =>
      nextPayDate ? predicateByDate(nextPayDate, filter) : false,
};
