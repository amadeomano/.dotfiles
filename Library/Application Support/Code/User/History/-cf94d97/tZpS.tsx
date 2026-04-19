import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import type {
  ColumnFilter,
  ColumnFilterGroup,
  FilterCategory,
  FilterCondition,
  FilterItemType,
  FilterOperator,
} from '@personio-web/design-system-component-advanced-filter';
import { Button } from '@personio-web/design-system-component-button';
import { icons } from '@personio-web/design-system-component-icon';

import { AddRuleMenu } from '../AddRuleMenu/AddRuleMenu';
import {
  AdvancedFilterItem,
  DEFAULT_CONDITIONS,
} from '../AdvancedFilterItem/AdvancedFilterItem';
import AdvancedFilterContext from '../Context/AdvancedFilterContext';
import { OperatorMenu } from '../OperatorMenu/OperatorMenu';

import styles from './AdvancedFilterGroup.module.scss';

type AdvancedFilterGroupProps = {
  className?: string;
  filters: Array<ColumnFilter | ColumnFilterGroup>;
  onFiltersChange: (filters: Array<ColumnFilter | ColumnFilterGroup>) => void;
  operator: FilterOperator;
  onOperatorChange: (operator: FilterOperator) => void;
  onRemoveGroup?: () => void;
  currDepth: number;
  filterPrefix?: string;
};

export const AdvancedFilterGroup = ({
  className,
  filters,
  onFiltersChange,
  operator,
  onOperatorChange,
  currDepth,
  onRemoveGroup,
}: AdvancedFilterGroupProps) => {
  const { t } = useTranslation('design-system');
  const {
    filterConfig,
    maxFilters,
    maxDepth,
    supportedOperators,
    availableCategories,
    disableDuplicateColumns,
    disabled,
  } = useContext(AdvancedFilterContext);

  let filteredCategories = availableCategories;
  if (disableDuplicateColumns) {
    const usedCategories = (
      filters.filter((f) => 'id' in f) as ColumnFilter[]
    ).map((f) => f.id);
    filteredCategories = filteredCategories.filter(
      (column) => !usedCategories.includes(column.id),
    );
  }

  const getFilterById = (columnId: string) => {
    return filterConfig.find((filter) => filter.columnId === columnId);
  };

  const onFilterItemChange = ({
    category,
    condition,
    value,
    index,
  }: {
    category: string;
    condition: FilterCondition;
    value: FilterItemType;
    index: number;
  }) => {
    console.log('[]', category, condition, value, index);
    const newFilters = [...filters];
    const validConditions =
      getFilterById(category)?.conditions || DEFAULT_CONDITIONS;
    newFilters[index] = {
      id: category,
      value: {
        condition: validConditions.includes(condition)
          ? condition
          : validConditions[0],
        value,
      },
    };
    console.log('[]', newFilters);
    onFiltersChange(newFilters);
  };

  const onRemoveFilter = (filterIndex: number) => {
    const newFilters = [...filters];
    newFilters.splice(filterIndex, 1);
    onFiltersChange(newFilters);
  };

  const onAddFilter = (columnId: string) => {
    const validConditions =
      getFilterById(columnId)?.conditions || DEFAULT_CONDITIONS;
    const newFilters = filters.concat({
      id: columnId,
      value: {
        condition: validConditions[0],
        value: undefined,
      },
    });
    onFiltersChange(newFilters);
  };

  const onAddGroup = () => {
    const newFilters = filters.concat({
      operator: supportedOperators[0],
      filters: [],
    });
    onFiltersChange(newFilters);
  };

  const onFilterGroupChange = (
    changedFilters: (ColumnFilter | ColumnFilterGroup)[],
    index: number,
  ) => {
    const newFilters = [...filters];
    const filterGroup = newFilters[index];
    newFilters[index] = {
      operator:
        'operator' in filterGroup
          ? filterGroup.operator
          : supportedOperators[0],
      filters: changedFilters,
    };
    onFiltersChange(newFilters);
  };

  const onNestedOperatorChange = (operator: FilterOperator, index: number) => {
    const newFilters = [...filters];
    const filterGroup = newFilters[index];
    newFilters[index] = {
      operator,
      filters: 'filters' in filterGroup ? filterGroup.filters : [],
    };
    onFiltersChange(newFilters);
  };

  const canAddRule = !disabled && filters.length < maxFilters;
  const canAddGroup = !disabled && currDepth < maxDepth;

  return (
    <div className={className}>
      <OperatorMenu
        value={operator}
        onChange={onOperatorChange}
        onRemoveGroup={onRemoveGroup}
      />
      <div className={styles.grid}>
        {filters.map((filter, i) => {
          if ('id' in filter) {
            const config = getFilterById(filter.id);
            if (!config) return null;
            return (
              <AdvancedFilterItem
                key={`${filter.id}_${filters
                  .filter((f) => 'id' in f && filter.id === f.id)
                  .findIndex((f) => f === filter)}`}
                type={config.field}
                selectedCategory={config.columnId}
                categories={availableCategories as FilterCategory[]}
                onChange={(changed) =>
                  onFilterItemChange({ ...changed, index: i })
                }
                onRemove={() => onRemoveFilter(i)}
                conditions={config.conditions}
                selectedCondition={
                  (filter.value?.condition ||
                    (config.conditions ||
                      DEFAULT_CONDITIONS)[0]) as FilterCondition
                }
                selectedValue={
                  filter.value?.value as FilterItemType | undefined
                }
                getOptions={config.getOptions}
                renderOption={config.renderOption}
                disabled={disabled}
              />
            );
          } else {
            return (
              <AdvancedFilterGroup
                key={i}
                className={cn(styles.group, {
                  [styles.nestedGroup]: currDepth === 2,
                })}
                currDepth={currDepth + 1}
                filters={filter.filters}
                onFiltersChange={(changed) => onFilterGroupChange(changed, i)}
                operator={filter.operator}
                onOperatorChange={(operator) =>
                  onNestedOperatorChange(operator, i)
                }
                onRemoveGroup={() => onRemoveFilter(i)}
              />
            );
          }
        })}
      </div>
      {(canAddRule || canAddGroup) && (
        <div className={styles.addButtonContainer}>
          {canAddRule && filteredCategories.length > 0 && (
            <AddRuleMenu
              categoryConfig={filteredCategories as FilterCategory[]}
              onSelect={onAddFilter}
            />
          )}
          {canAddGroup && (
            <Button
              variant="ghost"
              size="small"
              icon={icons.plus}
              onClick={onAddGroup}
            >
              {t('control-bar.filter-menu.add-group')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
