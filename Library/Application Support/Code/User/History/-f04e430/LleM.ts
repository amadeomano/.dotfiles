import {
  type FilterConfig,
  type ColumnFilter,
  type NumberFilterConditions,
  type TextFilterConditions,
  type SelectFilterConditions,
  type DateFilterConditions,
} from 'designSystem/component/advanced-filter';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { COLUMNS, taxYearColumn } from './columns';

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

type NumericCondition = NumberFilterConditions[number];
const predicateByNum = (source: number, filter: ColumnFilter['value']) => {
  const { value, condition } = filter;

  const val = value as number;
  const [minVal, maxVal] = value as [number, number];
  const cond = condition as NumericCondition;

  if (cond === 'equals') return source === val;
  if (cond === 'is_greater_than_or_equal') return source >= val;
  if (cond === 'is_less_than_or_equal') return source <= val;
  if (cond === 'is_within_range') return source >= minVal && source <= maxVal;

  return false;
};

type StringCondition = TextFilterConditions[number];
const predicateByStr = (source: string, filter: ColumnFilter['value']) => {
  const { value, condition } = filter;

  const val = value as string;
  const cond = condition as StringCondition;

  if (cond === 'contains') return source.includes(val);
  return false;
};

type SelectCondition = SelectFilterConditions[number];
const predicateBySelect = (source: string, filter: ColumnFilter['value']) => {
  const { value, condition } = filter;

  const val = value as string[];
  const cond = condition as SelectCondition;

  if (cond === 'equals') return val.includes(source);
  return false;
};

type DateCondition = DateFilterConditions[number];
const predicateByDate = (source: string, filter: ColumnFilter['value']) => {
  const { value, condition } = filter;

  const val = value as Date;
  const cond = condition as DateCondition;

  if (cond === 'is_on') return val.toISOString().split('T')[0] === source;
  return false;
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
      approvedDate && predicateByDate(approvedDate, filter),
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
    ({ condition, value }) =>
    ({ period }) =>
      predicateByNum(
        period,
        value as number | [number, number],
        condition as NumericCondition,
      ),
};

export const taxYearFilter: HandledFilterConfig = {
  columnId: COLUMNS.taxYear,
  field: 'text',
  conditions: ['contains'],
  filterHandler:
    ({ value }) =>
    (run) =>
      (taxYearColumn.accessor(run, 0) as string).includes(value as string),
};
