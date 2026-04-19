import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  EmployeePickerUIComponent,
  EmployeePickerMultiSelectProps,
  EmployeePickerSingleSelectProps,
} from '@personio-web/employees-organizations-feature-employee-picker';
import { InlineAlert } from 'designSystem/component/inline-alert';
import { Picker } from 'designSystem/component/picker';

import styles from './EmployeePicker.module.scss';

export const EmployeePickerUI: EmployeePickerUIComponent = (pickerProps) => {
  const {
    disabled,
    triggerClassName,
    placeholder,
    onChange,
    triggerType = 'button',
    value,
    size,
    id,
    onSearchChange,
    isError,
    maxItemsToShow,
    hideSelectAll,
  } = pickerProps;

  const { t } = useTranslation('employee-picker');

  const content = useMemo(
    () =>
      pickerProps.multiple !== true ? (
        <Picker
          {...pickerProps}
          multiple={false}
          selected={pickerProps.value}
        />
      ) : (
        <Picker
          {...pickerProps}
          multiple={true}
          selected={(pickerProps as EmployeePickerMultiSelectProps).value}
          onChange={(pickerProps as EmployeePickerMultiSelectProps).onChange}
          hideSelectAll={hideSelectAll}
        />
      ),
    [hideSelectAll, pickerProps],
  );

  if (triggerType === 'none') {
    return content;
  }

  return (
    <>
      <Picker.Root size={size} popoverContentClassname={styles.popoverContent}>
        {triggerType === 'search' ? (
          <Picker.SearchTrigger
            placeholder={placeholder}
            className={triggerClassName}
            size={size}
            maxItemsToShow={maxItemsToShow}
            onRemoveOption={(option) => {
              if (Array.isArray(value)) {
                (onChange as EmployeePickerMultiSelectProps['onChange'])(
                  value.filter((v) => v !== option.value),
                );
              } else {
                (onChange as EmployeePickerSingleSelectProps['onChange'])('');
              }
            }}
            onRemoveOverflowOptions={(overflowIndex) => {
              if (Array.isArray(value)) {
                (onChange as EmployeePickerMultiSelectProps['onChange'])(
                  value.slice(0, overflowIndex),
                );
              }
            }}
            onClear={() => {
              if (Array.isArray(value)) {
                (onChange as EmployeePickerMultiSelectProps['onChange'])([]);
              } else {
                (onChange as EmployeePickerSingleSelectProps['onChange'])('');
              }
            }}
            onSearchChange={onSearchChange}
            disabled={disabled}
          />
        ) : (
          <Picker.ButtonTrigger
            id={id}
            className={triggerClassName}
            size={size}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {content}
      </Picker.Root>

      {isError && (
        <InlineAlert
          message={t('error.description')}
          variant="ghost"
          sentiment="negative"
        />
      )}
    </>
  );
};
