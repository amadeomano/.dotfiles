import {
  type DOMAttributes,
  type ForwardRefExoticComponent,
  type FunctionComponent,
  type InputHTMLAttributes,
  type MemoExoticComponent,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  type RefObject,
} from 'react';

import type { ComponentMetadata } from '@personio-web/design-system-utils';
import type { EnumProps } from '@personio-web/design-system-component-enum-types';
import type { Flag } from '@personio-web/design-system-component-flag-types';
import type { IconSVGComponent } from '@personio-web/design-system-component-icon-types';
import type { TokenProps } from '@personio-web/design-system-component-token-types';
import type { TooltipProps } from '@personio-web/design-system-component-tooltip-types';
import type { PopoverContentProps } from '@personio-web/design-system-component-popover-types';

/*
 * Option label
 */
export type OptionLabelMeta = {
  label: string;
  placement?: 'top' | 'bottom';
};

interface BaseOptionLabelProps<T> {
  label: T;
  meta?: OptionLabelMeta;
}

export type TextOptionLabelProps = BaseOptionLabelProps<string> & {
  icon?: IconSVGComponent;
  flag?: Flag;
};

export type TokenOptionLabelProps = BaseOptionLabelProps<string> & {
  avatar?: Omit<TokenProps['avatar'], 'size'>;
};

export type EnumOptionLabelProps = Omit<
  BaseOptionLabelProps<string>,
  'meta'
> & {
  color?: EnumProps['color'];
};

export type OptionLabelType = {
  Text: ReactElement<TextOptionLabelProps>;
  Token: ReactElement<TokenOptionLabelProps>;
  Enum: ReactElement<EnumOptionLabelProps>;
};

type ExpendedOptionLabelProps = Pick<PickerOption, 'disabled'>;

export type TextLabel = (
  props: TextOptionLabelProps & ExpendedOptionLabelProps,
) => ReactElement;
export type TokenLabel = (
  props: TokenOptionLabelProps & ExpendedOptionLabelProps,
) => ReactElement;
export type EnumLabel = (
  props: EnumOptionLabelProps & ExpendedOptionLabelProps,
) => ReactElement;

export type OptionLabelComponentType = MemoExoticComponent<
  FunctionComponent<PickerOption>
> & {
  Text: TextLabel;
  Token: TokenLabel;
  Enum: EnumLabel;
};

/*
 * Option
 */
export type OptionTooltip = Pick<
  TooltipProps,
  'align' | 'content' | 'delayDuration'
> & {
  side?: 'left' | 'right';
};

export interface BasePickerOption<LabelType> {
  value: string;
  label: LabelType;
  disabled?: boolean;
  tooltip?: OptionTooltip;
  subOptions?: Omit<BasePickerOption<LabelType>, 'pinnable'>[];
  /**
   * Controls whether the option can be selected.
   * Can only be set to false for options that have subOptions.
   * Use this to create parent/category options that only expand/collapse their children.
   */
  selectable?: boolean;
  /** Controls whether the option can be pinned. */
  pinnable?: boolean;
}

// Ensures that all options in the array have count
export interface PickerOptionWithCount<LabelType>
  extends BasePickerOption<LabelType> {
  count: number;
  subOptions?: Omit<PickerOptionWithCount<LabelType>, 'pinnable'>[];
}

// Ensures that all root options in the array have group
export interface PickerOptionWithGroup<LabelType>
  extends BasePickerOption<LabelType> {
  group: string;
}

// Ensures that all root options in the array have group and all options have count
export interface PickerOptionWithCountAndGroup<LabelType>
  extends PickerOptionWithCount<LabelType> {
  group: string;
}

export type StringOption = BasePickerOption<string>;
export type TextOption = BasePickerOption<OptionLabelType['Text']>;
export type TokenOption = BasePickerOption<OptionLabelType['Token']>;
export type EnumOption = BasePickerOption<OptionLabelType['Enum']>;
export type StringOptionCount = PickerOptionWithCount<string>;
export type TextOptionCount = PickerOptionWithCount<OptionLabelType['Text']>;
export type TokenOptionCount = PickerOptionWithCount<OptionLabelType['Token']>;
export type EnumOptionCount = PickerOptionWithCount<OptionLabelType['Enum']>;
export type StringOptionGroup = PickerOptionWithGroup<string>;
export type TextOptionGroup = PickerOptionWithGroup<OptionLabelType['Text']>;
export type TokenOptionGroup = PickerOptionWithGroup<OptionLabelType['Token']>;
export type EnumOptionGroup = PickerOptionWithGroup<OptionLabelType['Enum']>;
export type StringOptionCountAndGroup = PickerOptionWithCountAndGroup<string>;
export type TextOptionCountAndGroup = PickerOptionWithCountAndGroup<
  OptionLabelType['Text']
>;
export type TokenOptionCountAndGroup = PickerOptionWithCountAndGroup<
  OptionLabelType['Token']
>;
export type EnumOptionCountAndGroup = PickerOptionWithCountAndGroup<
  OptionLabelType['Enum']
>;

export type PickerOption =
  | StringOption
  | TextOption
  | TokenOption
  | EnumOption
  | StringOptionCount
  | TextOptionCount
  | TokenOptionCount
  | EnumOptionCount
  | StringOptionGroup
  | TextOptionGroup
  | TokenOptionGroup
  | EnumOptionGroup
  | StringOptionCountAndGroup
  | TextOptionCountAndGroup
  | TokenOptionCountAndGroup
  | EnumOptionCountAndGroup;

/*
 * Opt-in configs
 */
interface OptInConfig {
  enabled: boolean;
}

export type ExpandConfig = OptInConfig & {
  onExpandToggle?: (value: string) => void;
};

export type SearchConfig = OptInConfig & {
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
  maxItemsToShow?: number;
  onSearchChange?: (newSearch: string) => void;
  debounceTime?: number;
  fuzzy?: boolean;
  hideSelectedOptions?: boolean;
};

export type PaginationConfig = OptInConfig & {
  isLoading: boolean;
  pageSize: number;
  hasMoreToLoad: boolean;
  onLoadMore: () => void;
};

export type VirtualizationConfig = OptInConfig & {
  overscan?: number;
};

/*
 * Picker component
 */

// Ensures only option type at a time
export type PickerOptions =
  | StringOption[]
  | TextOption[]
  | TokenOption[]
  | EnumOption[]
  | StringOptionCount[]
  | TextOptionCount[]
  | TokenOptionCount[]
  | EnumOptionCount[]
  | StringOptionGroup[]
  | TextOptionGroup[]
  | TokenOptionGroup[]
  | EnumOptionGroup[]
  | StringOptionCountAndGroup[]
  | TextOptionCountAndGroup[]
  | TokenOptionCountAndGroup[]
  | EnumOptionCountAndGroup[];

type BaseSelectPickerProps = {
  options: PickerOptions;
  autoFocus?: boolean;
  placeholder?: string;
  pinned?: string[];
  onPinToggle?: (value: string) => void;
};

export type SingleSelectPickerProps = BaseSelectPickerProps & {
  multiple?: false;
  hideRadio?: boolean;
  hideClear?: boolean;
  selected: string;
  onChange: (newValue: string) => void;
};

export type MultiSelectPickerProps = BaseSelectPickerProps & {
  multiple: true;
  hideSelectAll?: boolean;
  selected: string[];
  onChange: (newValue: string[]) => void;
};

export type PickerTriggerSize = 'small' | 'default' | 'fullWidth';

export type PickerRootProps = PropsWithChildren<{
  metadata?: ComponentMetadata;
  popoverContentClassname?: string;
  defaultOpen?: boolean;
  onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  onEscapeKeyDown?: (e?: KeyboardEvent) => void;
  variant?: 'default' | 'inline';
  disabled?: boolean;
  keepSearchAfterSelect?: boolean;
  side?: PopoverContentProps['side'];
  /** Width of the picker popover */
  width?: number;
  size?: PickerTriggerSize;
  /** If true, the picker will open in full screen on mobile. */
  preferFullScreenOnMobile?: boolean;
  title?: string;
}>;

export type PickerRootComponent = (
  props: PickerRootProps,
) => ReactElement | null;

export type PickerButtonTriggerProps = {
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  icon?: IconSVGComponent;
  flag?: Flag;
  size?: PickerTriggerSize;
  children?: string;
  metadata?: ComponentMetadata;
  onClick?: React.ComponentProps<'button'>['onClick'];
  variant?: 'default' | 'ghost';
  typography?: 'default' | 'strong';
};

export type PickerButtonTriggerComponent = ForwardRefExoticComponent<
  PickerButtonTriggerProps & RefAttributes<HTMLButtonElement>
>;

export type PickerCustomTriggerComponent = ForwardRefExoticComponent<
  {
    children: ReactElement;
    displayValue?: string;
    forwardProps?: boolean;
  } & RefAttributes<HTMLDivElement>
>;

export type PickerSearchTriggerProps = Pick<
  SearchConfig,
  | 'onSearchChange'
  | 'placeholder'
  | 'debounceTime'
  | 'autoFocus'
  | 'fuzzy'
  | 'hideSelectedOptions'
> & {
  onClear: () => void;
  onRemoveOption: (option: PickerOption) => void;
  onRemoveOverflowOptions?: (overflowIndex: number) => void;
  maxItemsToShow?: number;
  className?: string;
  disabled?: boolean;
  size?: PickerTriggerSize;
  variant?: 'default' | 'inline';
  fullWidth?: boolean;
  multiple?: boolean;
  /* Will not wrap the selected options */
  wrap?: boolean;
  /* Will not show selected options when searching */
  clearSelectedOnSearch?: boolean;
  hideClear?: boolean;
};

export type PickerSearchTriggerComponent = ForwardRefExoticComponent<
  PickerSearchTriggerProps & RefAttributes<HTMLDivElement>
>;

export type PickerProps = (SingleSelectPickerProps | MultiSelectPickerProps) & {
  metadata?: ComponentMetadata;
  expandConfig?: ExpandConfig;
  searchConfig?: SearchConfig;
  paginationConfig?: PaginationConfig;
  virtualizationConfig?: VirtualizationConfig;
  children?: ReactNode;
  /** For internal use, will be overridden by internal styles **/
  style?: React.CSSProperties;
  ariaLabel?: string;
};

export type PickerContentComponent = ForwardRefExoticComponent<
  PickerProps & RefAttributes<HTMLDivElement>
>;

export type PickerFooterProps = {
  children: ReactNode;
  metadata?: ComponentMetadata;
  contentRef?: RefObject<HTMLDivElement>;
};

export type PickerFooterComponent = ForwardRefExoticComponent<
  PickerFooterProps & RefAttributes<HTMLDivElement>
>;

export type PickerComponent = PickerContentComponent & {
  Root: PickerRootComponent;
  ButtonTrigger: PickerButtonTriggerComponent;
  CustomTrigger: PickerCustomTriggerComponent;
  SearchTrigger: PickerSearchTriggerComponent;
  Content: PickerContentComponent;
  ListBox: ListBoxComponent;
  Footer: PickerFooterComponent;
};

/*
 * Option
 */
export type EnhancedOption = PickerOption & {
  depth?: number;
  parent?: EnhancedOption;
};

/*
 * TokenizedSearchInput
 */
export type TokenizedSearchInputPropsExtended = Pick<
  SearchConfig,
  'placeholder' | 'autoFocus' | 'inputRef' | 'hideSelectedOptions'
> & {
  value: string;
  selectedOptions: EnhancedOption[];
  onChange: (newValue: string) => void;
  onClear: () => void;
  onRemoveOption: (option: EnhancedOption) => void;
  onRemoveOverflowOptions?: (overflowIndex: number) => void;
  className?: string;
  disabled?: boolean;
  metadata?: ComponentMetadata;
  size?: PickerTriggerSize;
  fullWidth?: boolean;
  multiple?: boolean;
  hideClear?: boolean;
  totalSelected?: number;
  maxItemsToShow?: number;
  expanded?: boolean;
} & Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'onClick' | 'onBlur' | 'onKeyDown' | 'onPaste'
  > &
  Pick<PickerSearchTriggerProps, 'wrap' | 'clearSelectedOnSearch'>;

export type TokenizedSearchInputProps = Omit<
  TokenizedSearchInputPropsExtended,
  'className'
>;

export type TokenizedSearchInputComponent = ForwardRefExoticComponent<
  TokenizedSearchInputProps & RefAttributes<HTMLDivElement>
>;

/*
 * List Item
 */
export type ListBoxItemProps = Omit<PickerOption, 'label'> &
  Pick<DOMAttributes<HTMLDivElement>, 'onMouseEnter'> &
  PropsWithChildren<{
    selected?: boolean | 'indeterminate';
    multiSelectable?: boolean;
    hideRadio?: boolean; // TODO: remove this prop
    label?: string;
    expanded?: boolean;
    onSelectToggle: (value: string) => void;
    onExpandToggle: () => void;
    active?: boolean;
    metadata?: ComponentMetadata;
  }>;

export type ListBoxItem = (props: ListBoxItemProps) => ReactElement;

export type ListBoxGroupTitleProps = {
  label: string;
};

export type ListBoxGroupTitle = (props: ListBoxGroupTitleProps) => ReactElement;

export type ListBoxProps = PropsWithChildren<{
  id: string;
  ariaLabel?: string;
  multiSelectable?: boolean;
  activeDescendant?: string;
}>;

export type ListBoxComponent = ForwardRefExoticComponent<
  ListBoxProps & RefAttributes<HTMLDivElement>
> & {
  Item: ListBoxItem;
  GroupTitle: ListBoxGroupTitle;
};
