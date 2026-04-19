import { useState } from 'react';

import type {
  EmployeePickerFeature,
  EmployeePickerUIProps,
} from '@personio-web/employees-organizations-feature-employee-picker';

import { PAGINATION_LIMIT_PERSONS } from './utils/constants';
import { useEmployeePickerContent } from './hooks/useEmployeePickerContent';
import { EmployeePickerUI } from './components/EmployeePickerUI';

export const EmployeePicker: EmployeePickerFeature = ({
  exclude = [],
  disabledIds = [],
  allowedStatuses,
  filters,
  maxItemsToShow = PAGINATION_LIMIT_PERSONS,
  multiple = false,
  searchConfig,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState('');
  const onSearchChange = (newSearch: string) => {
    setSearchValue(newSearch.trim());
  };

  const { props: contentProps } = useEmployeePickerContent({
    value: props.value,
    exclude,
    disabledIds,
    searchValue,
    onSearchChange,
    allowedStatuses,
    filters,
    searchConfig,
  });

  const uiProps = {
    ...props,
    multiple,
    maxItemsToShow,
  } as EmployeePickerUIProps;

  return (
    <EmployeePickerUI
      {...uiProps}
      {...contentProps}
      onSearchChange={onSearchChange}
    />
  );
};
