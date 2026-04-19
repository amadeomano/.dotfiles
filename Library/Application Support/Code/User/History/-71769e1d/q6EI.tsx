import { useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import type { Table } from '@tanstack/react-table';

import type {
  UseTableParams,
  UseTableReturnType,
} from '@personio-web/design-system-component-table';

import { useTableColumnOrdering } from './useTableColumnOrdering';
import { useTableColumnPinning } from './useTableColumnPinning';
import { useTableColumnSizing } from './useTableColumnSizing';
import { useTableColumnVisibility } from './useTableColumnVisibility';
import { useTableExpansion } from './useTableExpansion';
import { useTableFilters } from './useTableFilters';
import { useTableGrouping } from './useTableGrouping';
import { useTablePagination } from './useTablePagination';
import { TablePreferenceStorageKeys } from './useTablePreferences';
import { useTableSearch } from './useTableSearch';
import { useTableSelection } from './useTableSelection';
import { useTableSorting } from './useTableSorting';

export const useTable = (params?: UseTableParams): UseTableReturnType => {
  const maybeGetUserPreferenceTableId = (key: TablePreferenceStorageKeys) => {
    // default preferUserPreference to true, only return undefined
    // when the value is false
    if (params?.id && params.preferUserPreference?.[key] !== false) {
      return params.id;
    }
    return undefined;
  };

  const [] = useState();

  const selection = useTableSelection(params?.state?.selectedRows);
  const expansion = useTableExpansion(params?.state?.expandedRows);
  const pagination = useTablePagination(params?.state?.pagination);
  const columnVisibility = useTableColumnVisibility(
    params?.state?.hiddenColumns,
  );
  const order = useTableColumnOrdering(params?.state?.order);
  const pinning = useTableColumnPinning(params?.state?.pinning);
  const columnSizing = useTableColumnSizing(
    maybeGetUserPreferenceTableId(TablePreferenceStorageKeys.COLUMN_SIZING),
  );
  const sorting = useTableSorting(
    params?.state?.sorting,
    maybeGetUserPreferenceTableId(TablePreferenceStorageKeys.SORTING),
  );
  const search = useTableSearch(params?.state?.search);
  const filters = useTableFilters(params?.state?.filters);
  const groups = useTableGrouping(params?.state?.groups);

  useDeepCompareEffect(() => {
    pagination.updaters.setPagination({
      pageIndex: params?.state?.pagination?.pageIndex ?? 0,
      pageSize: params?.state?.pagination?.pageSize ?? 10,
    });
    search.updaters.replace(params?.state?.search ?? '');
    filters.updaters.replaceFilters(params?.state?.filters ?? []);
    groups.updaters.replace(params?.state?.groups ?? []);
  }, [params?.state?.search, params?.state?.filters, params?.state?.groups]);

  useDeepCompareEffect(() => {
    params?.onTableStateChange?.({
      filters: filters.filters,
      pagination,
      search: search.term,
      sorting: sorting.sorting,
    });
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting.sorting,
    search.term,
    filters.filters,
  ]);

  return {
    selection,
    expansion,
    pagination,
    columnVisibility,
    sorting,
    search,
    filters,
    order,
    pinning,
    columnSizing,
    groupings: groups,
  };
};
