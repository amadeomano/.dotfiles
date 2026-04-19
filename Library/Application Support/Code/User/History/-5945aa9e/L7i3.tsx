import type {
  AdvancedFilterComponent,
  ColumnFilter,
  ColumnFilterGroup,
  FilterOperator,
} from '@personio-web/design-system-component-advanced-filter';

import { AdvancedFilterGroup } from './AdvancedFilterGroup/AdvancedFilterGroup';
import { AdvancedFilterContextProvider } from './Context/AdvancedFilterContext';

const DEFAULT_MAX_RULES_PER_GROUP = 10;
const DEFAULT_MAX_DEPTH = 1;

export const AdvancedFilter: AdvancedFilterComponent = ({
  columnConfig,
  filterConfig,
  filters,
  maxRulesPerGroup = DEFAULT_MAX_RULES_PER_GROUP,
  maxDepth = DEFAULT_MAX_DEPTH,
  supportedOperators = ['and'],
  onChange,
  filterPrefix,
  disableDuplicateColumns,
  disabled = false,
}) => {
  const onFiltersChange = (
    newFilters: Array<ColumnFilter | ColumnFilterGroup>,
  ) => {
    onChange({
      operator: filters?.operator || supportedOperators[0],
      filters: newFilters,
    });
  };

  const onOperatorChange = (operator: FilterOperator) => {
    onChange({
      operator,
      filters: filters?.filters || [],
    });
  };

  return (
    <AdvancedFilterContextProvider
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      maxFilters={maxRulesPerGroup}
      maxDepth={maxDepth}
      supportedOperators={supportedOperators}
      filterPrefix={filterPrefix}
      disableDuplicateColumns={disableDuplicateColumns}
      disabled={disabled}
    >
      <AdvancedFilterGroup
        filters={filters?.filters || []}
        onFiltersChange={onFiltersChange}
        operator={filters?.operator || supportedOperators[0]}
        onOperatorChange={onOperatorChange}
        currDepth={1}
      />
    </AdvancedFilterContextProvider>
  );
};
