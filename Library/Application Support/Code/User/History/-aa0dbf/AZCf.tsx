import React from 'react';
import { FieldValues, useController } from 'react-hook-form';
import { ControlledSelectComponentProps } from '@personio-web/payroll-component-controlled-select-types';
import { Select } from 'designSystem/component/select';

export const ControlledSelect = <FormValues extends FieldValues>({
  name,
  rules = {},
  defaultValue,
  children,
  ...selectProps
}: ControlledSelectComponentProps<FormValues>) => {
  const { field, fieldState } = useController({
    defaultValue,
    name,
    rules,
  });

  // TODO: error state

  return (
    <Select
      {...selectProps}
      {...field}
      aria-invalid={Boolean(fieldState.error)}
      aria-label={name}
      onValueChange={(value) => {
        selectProps.onValueChange?.(value);
        field.onChange(value);
      }}
    >
      {children}
    </Select>
  );
};
