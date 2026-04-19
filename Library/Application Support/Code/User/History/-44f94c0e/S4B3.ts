import {
  type ColumnFilter,
  type NumberFilterConditions,
  type TextFilterConditions,
  type SelectFilterConditions,
  type DateFilterConditions,
} from 'designSystem/component/advanced-filter';

type NumericCondition = NumberFilterConditions[number];
export const predicateByNum = (
  source: number,
  filter: ColumnFilter['value'],
) => {
  const { value, condition } = filter;

  const val = value as number;
  const [minVal, maxVal] = Array.isArray(value)
    ? (value as [number, number])
    : [];
  const cond = condition as NumericCondition;

  if (cond === 'equals') return source === val;
  if (cond === 'is_greater_than_or_equal') return source >= val;
  if (cond === 'is_less_than_or_equal') return source <= val;
  if (cond === 'is_within_range') return source >= minVal && source <= maxVal;

  return false;
};

type StringCondition = TextFilterConditions[number];
export const predicateByStr = (
  source: string,
  filter: ColumnFilter['value'],
) => {
  const { value, condition } = filter;

  const val = value as string;
  const cond = condition as StringCondition;

  if (cond === 'contains') return source.includes(val);
  return false;
};

type SelectCondition = SelectFilterConditions[number];
export const predicateBySelect = (
  source: string,
  filter: ColumnFilter['value'],
) => {
  const { value, condition } = filter;

  const val = value as string[];
  const cond = condition as SelectCondition;

  if (cond === 'equals') return val.includes(source);
  return false;
};

type DateCondition = DateFilterConditions[number];
export const predicateByDate = (
  source: string,
  filter: ColumnFilter['value'],
) => {
  const { value, condition } = filter;

  const val = value as Date;
  const cond = condition as DateCondition;

  if (cond === 'is_on') return val.toISOString().split('T')[0] === source;
  return false;
};
