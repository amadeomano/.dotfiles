import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { suffixMetadata } from '@personio-web/design-system-utils';
import {
  type FilterConfig,
  AdvancedFilter,
  compareFilters,
  filterInvalidFilterValues,
} from '@personio-web/design-system-component-advanced-filter';
import type {
  ColumnConfig,
  ColumnFilter,
} from '@personio-web/design-system-component-advanced-filter-types';
import { type ControlComponents } from '@personio-web/design-system-component-control-bar-types';
import { ControlTrigger } from '@personio-web/design-system-component-control-trigger';
import { icons } from '@personio-web/design-system-component-icon';
import {
  OptionLabel,
  Picker,
} from '@personio-web/design-system-component-picker';
import { Popover } from '@personio-web/design-system-component-popover';

import { ControlActionBar } from './controlActionBar/ControlActionBar';

const defaultFilters: ColumnFilter[] = [];

const FilterControl: ControlComponents['Filter'] = ({
  columnConfig,
  filterConfig: filterConfigProp,
  onChange,
  filters = defaultFilters,
  customAttributes = [],
  metadata = undefined,
  enableApplyButton = false,
}) => {
  const { t } = useTranslation('design-system');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<ColumnFilter[]>(
    filters || [],
  );
  const isSubmitButtonDisabled = selectedFilters.length === 0;
  const finalColumnConfig = (columnConfig || []).concat(customAttributes);

  const previousFiltersRef = useRef(filters);
  useEffect(() => {
    if (previousFiltersRef.current !== filters) {
      previousFiltersRef.current = filters;
      setSelectedFilters(filters);
    }
  }, [filters]);

  if (
    finalColumnConfig.length === 0 ||
    filterConfigProp === undefined ||
    onChange === undefined
  ) {
    return null;
  }

  // for backward compatibility, to remove when changing table API for all consumers
  const filterConfig = filterConfigProp.map((item) =>
    item.options
      ? { ...item, getOptions: () => Promise.resolve(item.options) }
      : item,
  );

  const onChangeWithValidityCheck = (changedFilters: ColumnFilter[]) => {
    if (selectedFilters.length > 0 && changedFilters.length === 0) {
      // we are removing all filters, close the popover
      setIsOpen(false);
    }
    const oldFiltersWithValidityCheck =
      filterInvalidFilterValues(selectedFilters);
    const newFiltersWithValidityCheck =
      filterInvalidFilterValues(changedFilters);
    setSelectedFilters(changedFilters);
    // Only issue an onChange callback if valid filters have changed since the last operation
    if (
      !enableApplyButton &&
      (oldFiltersWithValidityCheck.length !==
        newFiltersWithValidityCheck.length ||
        (oldFiltersWithValidityCheck &&
          newFiltersWithValidityCheck &&
          !compareFilters(
            oldFiltersWithValidityCheck,
            newFiltersWithValidityCheck,
          )))
    ) {
      onChange(newFiltersWithValidityCheck);
    }
  };

  const onSubmit = () => {
    onChange(selectedFilters);
    setIsOpen(false);
  };
  const onCancel = () => {
    onChangeWithValidityCheck(filters);
    setIsOpen(false);
  };

  const getFilterById = (columnId: string) => {
    return (filterConfig as FilterConfig[]).find(
      (filter: FilterConfig) => filter.columnId === columnId,
    );
  };

  const numOfRules = filters.length;
  const moreThanThree = numOfRules >= 3;
  const filterNames = finalColumnConfig
    .filter((col: ColumnConfig) =>
      filters.some((filter: ColumnFilter) => filter.id === col.id),
    )
    .map((col: ColumnConfig) => col.header);

  const label = `${t('control-bar.trigger.filtered-by')} ${
    moreThanThree
      ? `${numOfRules} ${t('control-bar.trigger.filter-rules')}`
      : filterNames.join(', ')
  }`;

  const onAddInitialFilter = (selected: string) => {
    const validConditions = getFilterById(selected)?.conditions;
    onChangeWithValidityCheck([
      {
        id: selected,
        value: {
          condition: validConditions?.[0] || 'equals',
          value: undefined,
        },
      },
    ]);
  };

  const isActive = filters.length > 0;
  const hasSelectedFilters = selectedFilters.length > 0;

  return (
    <Popover
      metadata={suffixMetadata(metadata, 'popover')}
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <Popover.Trigger>
        <ControlTrigger
          icon={icons.filter}
          isActive={isActive}
          data-value={isActive}
          onClear={() => onChangeWithValidityCheck([])}
        >
          {isActive ? label : t('control-bar.trigger.filter')}
        </ControlTrigger>
      </Popover.Trigger>
      <Popover.Content align="start">
        {hasSelectedFilters === true && (
          <>
            <AdvancedFilter
              columnConfig={finalColumnConfig}
              filterConfig={filterConfig as FilterConfig[]}
              filters={{ operator: 'and', filters: selectedFilters }}
              onChange={(newFilters) => {
                onChangeWithValidityCheck(
                  (newFilters?.filters || []) as ColumnFilter[],
                );
              }}
              disableDuplicateColumns
            />
            {enableApplyButton && (
              <ControlActionBar
                isApplyDisabled={isSubmitButtonDisabled}
                onApply={onSubmit}
                onCancel={onCancel}
              />
            )}
          </>
        )}
        {hasSelectedFilters === false && (
          <Picker
            metadata={suffixMetadata(metadata, 'picker')}
            options={finalColumnConfig
              .filter((column) =>
                filterConfig.some((filter) => filter.columnId === column.id),
              )
              .map((value: ColumnConfig) => ({
                ...(value.group ? { group: value.group } : {}),
                value: value.id,
                label: (
                  <OptionLabel.Text
                    label={value.header || ''}
                    icon={value.icon}
                  />
                ),
              }))}
            multiple={false}
            selected=""
            onChange={onAddInitialFilter}
            hideRadio
          />
        )}
      </Popover.Content>
    </Popover>
  );
};

export { FilterControl };
