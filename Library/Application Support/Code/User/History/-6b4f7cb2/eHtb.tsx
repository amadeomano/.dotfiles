import React from 'react';

import type {
  ColumnFilter,
  UseTableFiltersReturnType,
} from '@personio-web/design-system-component-table';

export const useTableFilters = (
  initialFilters?: ColumnFilter[],
): UseTableFiltersReturnType => {
  const [filters, setFilters] = React.useState<ColumnFilter[]>(
    initialFilters ?? [],
  );
  const clear = React.useCallback(() => {
    setFilters([]);
  }, []);
  return {
    filters,
    updaters: {
      clear,
      replaceFilters: (filters) => {
        console.log('[]UTF', filters);
        setFilters(filters as ColumnFilter[]);
      },
    },
  };
};
