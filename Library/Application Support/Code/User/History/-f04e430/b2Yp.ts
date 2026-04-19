import {
  type FilterConfig,
  type ColumnFilter,
  type NumberFilterConditions,
  type TextFilterConditions,
  type SelectFilterConditions,
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
const predicateBySelect = (
  source: string,
  target: string[],
  condition: SelectCondition,
) => {
  if (condition === 'equals') return target.includes(source);
  return false;
};

export const titleFilter: HandledFilterConfig = {
  columnId: COLUMNS.title,
  field: 'text',
  conditions: ['contains'],
  filterHandler:
    ({ condition, value }) =>
    ({ payDate }) =>
      predicateByStr(payDate, value as string, condition as StringCondition),
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
    ({ condition, value }) =>
    ({ employeeResults }) =>
      predicateByNum(
        employeeResults.length,
        value as number | [number, number],
        condition as NumericCondition,
      ),
};

export const statusFilter: HandledFilterConfig = {
  columnId: COLUMNS.status,
  field: 'select',
  conditions: ['equals'],
  options: Object.values(statusOptions),
  filterHandler:
    ({ condition, value }) =>
    ({ status }) =>
      predicateBySelect(status, value),
};

export const approvedOnFilter: HandledFilterConfig = {
  columnId: COLUMNS.approvedOn,
  field: 'date',
  conditions: ['is_on'],
  filterHandler:
    ({ value }) =>
    ({ approvedDate }) =>
      (value as Date).toISOString().split('T')[0] === approvedDate,
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
