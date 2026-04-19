import type {
  FilterConfig,
  ColumnFilter,
} from 'designSystem/component/advanced-filter';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { type PayGroup } from '../../../hooks/payroll-lifecycle/usePayGroups';
import { COLUMNS, taxYearColumn, getPayGroupById } from './columns';
import {
  predicateByStr,
  predicateByNum,
  predicateByDate,
  predicateBySelect,
} from './filterUtils';

type Opt<T> = { id: T; value: string };
type StatusOptions = { [Status in PayrollRun['status']]: Opt<Status> };
const statusOptions: StatusOptions = {
  APPROVED: { id: 'APPROVED', value: 'Approved' },
  DRAFT: { id: 'DRAFT', value: 'Draft' },
};

export type HandledFilterConfig = FilterConfig & {
  filterHandler: (
    colFilter: ColumnFilter['value'],
  ) => (predicate: PayrollRun) => boolean;
};

export const titleFilter: HandledFilterConfig = {
  columnId: COLUMNS.title,
  field: 'text',
  conditions: ['contains'],
  filterHandler:
    (filter) =>
    ({ payDate }) =>
      predicateByStr(payDate, filter),
};

export const peopleFilter: HandledFilterConfig = {
  columnId: COLUMNS.people,
  field: 'number',
  conditions: [
    'equals',
    'is_greater_than_or_equal',
    'is_greater_than_or_equal',
    'is_within_range',
  ],
  filterHandler:
    (filter) =>
    ({ employeeResults }) =>
      predicateByNum(employeeResults.length, filter),
};

export const scheduleFilter: (payGroups: PayGroup[]) => HandledFilterConfig = (
  payGroups,
) => ({
  columnId: COLUMNS.schedule,
  field: 'select',
  conditions: ['equals'],
  filterHandler:
    (filter) =>
    ({ payGroupId }) =>
      predicateBySelect(employeeResults.length, filter),
});

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

export const approvedOnFilter: HandledFilterConfig = {
  columnId: COLUMNS.approvedOn,
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
    'is_greater_than_or_equal',
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
