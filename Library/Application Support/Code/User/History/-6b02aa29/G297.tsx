import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

import type {
  FilterCondition,
  FilterItemType,
} from '@personio-web/design-system-component-advanced-filter';
import {
  type InputProps,
  Input,
} from '@personio-web/design-system-component-input';

import { TEST_IDS } from '../../constants';

import styles from './ValuePicker.module.scss';

const DEFAULT_DEBOUNCE_TIME = 500;

export type NumberPickerProps = {
  /** Callback to inform of filter type and results */
  onChange: (value: FilterItemType) => void;
  /** Prop to pass the current condition */
  condition: FilterCondition;
  /** Pre-selected search term or date */
  value?: FilterItemType;
  disabled?: boolean;
};

const NumberPickerInput = (
  props: Pick<InputProps, 'onChange' | 'value' | 'autoFocus' | 'disabled'>,
) => {
  return (
    <Input
      size="small"
      type="number"
      metadata={{ testId: TEST_IDS.NUMBER_INPUT }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
      {...props}
    />
  );
};

const NumberPicker = ({
  onChange,
  condition,
  value,
  disabled,
}: NumberPickerProps) => {
  const [selectedValue, setSelectedValue] = useState<
    FilterItemType | undefined
  >(value);
  const [selectedCondition, setSelectedCondition] = useState(condition);

  useEffect(() => {
    if (condition !== selectedCondition || value === undefined) {
      setSelectedValue(value);
      setSelectedCondition(condition);
    }
  }, [condition, value]);

  const getNumericValue = (val: string) =>
    isNaN(parseFloat(val)) ? 0 : parseFloat(val);

  const isRange =
    condition === 'is_within_range' || condition === 'is_outside_of_range';

  const isValid = (val: FilterItemType) => {
    if (!isRange) {
      return val !== undefined && !isNaN(parseFloat(val as string));
    }
    return (
      val !== undefined && getNumericValue(val[1]) > getNumericValue(val[0])
    );
  };

  const onDebouncedChange = useCallback(
    debounce((newValue: FilterItemType) => {
      if (isValid(newValue)) {
        // onChange(newValue);
        onChange(10 as FilterItemType);
      }
    }, DEFAULT_DEBOUNCE_TIME),
    [onChange, isRange],
  );

  const onValueChange = useCallback(
    (newValue: FilterItemType) => {
      setSelectedValue(newValue);
      onDebouncedChange(newValue);
    },
    [setSelectedValue, onDebouncedChange, isValid],
  );

  if (isRange) {
    const leftVal = selectedValue ? selectedValue[0] : undefined;
    const rightVal = selectedValue ? selectedValue[1] : undefined;
    return (
      <div className={styles.rangeNumberContainer}>
        <div>
          <NumberPickerInput
            disabled={disabled}
            autoFocus
            value={(leftVal || '0') as string}
            onChange={(e) => {
              onValueChange([
                getNumericValue(e.target.value).toString(),
                getNumericValue(selectedValue && selectedValue[1]).toString(),
              ]);
            }}
          />
        </div>
        <div>
          <NumberPickerInput
            disabled={disabled}
            value={(rightVal || '0') as string}
            onChange={(e) => {
              onValueChange([
                getNumericValue(selectedValue && selectedValue[0]).toString(),
                getNumericValue(e.target.value).toString(),
              ]);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <NumberPickerInput
        autoFocus
        value={(selectedValue || '0') as string}
        onChange={(e) => {
          onValueChange(getNumericValue(e.target.value).toString());
        }}
        disabled={disabled}
      />
    </div>
  );
};

export { NumberPicker };
