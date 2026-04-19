import type {
  ColumnFilter,
  UseTableSortingReturnType,
} from 'designSystem/component/table';

type SortId = string;
type SortDir = string;
type SortOptions = UseTableSortingReturnType['sorting'];
export type SortString = string | `${SortId};${SortDir}`;

type FilterId = string;
type FilterCondition = string;
type FilterValue = string;
export type FilterString = `${FilterId};${FilterCondition};${FilterValue}`;

export const serializeSort = ({
  id,
  desc,
}: NonNullable<SortOptions>): SortString => `${id};${desc ? 'desc' : 'asc'}`;

export const deserializeSort = (sortString: SortString): SortOptions => {
  const [id, desc] = sortString.split(';');
  return { id, desc: desc === 'desc' };
};

export const serializeFilter = ({
  id,
  value: { value, condition },
}: ColumnFilter): FilterString =>
  `${id};${condition};${Array.isArray(value) ? value.join('|') : value}`;

export const deserializeFilter = (filterString: FilterString): ColumnFilter => {
  const [id, condition, value] = filterString.split(';');
  return { id, value: { value, condition } };
};

export const deserializeArrayFilter = (
  filterString: FilterString,
): ColumnFilter => {
  const [id, condition, value] = filterString.split(';');
  return { id, value: { value: value.split('|'), condition } };
};
