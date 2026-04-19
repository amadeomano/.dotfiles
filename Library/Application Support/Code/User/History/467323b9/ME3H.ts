import { type Person } from '@personio-web/employees-organizations-data-person-employment-types';
import {
  type PickerProps,
  type PickerRootProps,
  type PickerTriggerSize,
} from 'designSystem/component/picker';

export type EmployeePickerMultiSelectProps = {
  multiple: true;
  value: string[];
  onChange: (options: string[]) => void;
};

export type EmployeePickerSingleSelectProps = {
  value: string;
  onChange: (options: string) => void;
};

type EmployeePickerTriggerType = 'button' | 'search' | 'none';

type EmployeePickerCommonProps = (
  | EmployeePickerMultiSelectProps
  | EmployeePickerSingleSelectProps
) & {
  id?: string;
  disabled?: boolean;
  triggerClassName?: string;
  placeholder: string;
  triggerType?: EmployeePickerTriggerType;
  size?: PickerTriggerSize;
  hideSelectAll?: boolean;
  maxItemsToShow?: number;
  multiple?: boolean;
  searchConfig?: PickerProps['searchConfig'];
  side?: PickerRootProps['side'];
};

type EmployeePickerSearchProps = {
  searchValue: string;
  onSearchChange: (searchValue: string) => void;
};

type EmployeePickerPickerProps = Pick<
  PickerProps,
  'searchConfig' | 'paginationConfig' | 'options'
>;

export type EmployeePickerUIProps = EmployeePickerCommonProps &
  EmployeePickerPickerProps &
  Partial<Pick<EmployeePickerSearchProps, 'onSearchChange'>> & {
    isError?: boolean;
  };

type EmployeePickerFilterProps = {
  exclude?: string[];
  disabledIds?: string[];
  /**
   * @deprecated Use `filters.statuses` instead. This prop will be removed in a future version.
   */
  allowedStatuses?: NonNullable<Person['status']['value']>[];
  filters?: {
    statuses?: NonNullable<Person['status']['value']>[];
    legalEntityIds?: string[];
  };
};

export type EmployeePickerProps = EmployeePickerCommonProps &
  EmployeePickerFilterProps;

export type EmployeePickerFeature = React.FC<EmployeePickerProps>;
export type EmployeePickerUIComponent = React.FC<EmployeePickerUIProps>;

type UseEmployeePickerContentHookParams = Pick<
  EmployeePickerCommonProps,
  'value' | 'searchConfig'
> &
  EmployeePickerFilterProps &
  EmployeePickerSearchProps;

type UseEmployeePickerContentHookParamsReturn = {
  props: Required<EmployeePickerPickerProps> & {
    isError: boolean;
  };
};

export type UseEmployeePickerContentHook = (
  params: UseEmployeePickerContentHookParams,
) => UseEmployeePickerContentHookParamsReturn;
