import type { IconSVGComponent } from 'designSystem/component/icon';

export type InfoItem = {
  key: string;
  label: string;
  count?: number;
};

export type InfoPicker = {
  placeholder?: string;
  list: InfoItem[];
  selected: string;
  onSelect: (key: string) => void;
};

export type Action = {
  title: string;
  isLoading?: boolean;
  isVisible?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
};

export type PayrollLayoutComponentProps = {
  title: string;
  legalEntities?: InfoPicker;
  tabs?: InfoPicker;
  primaryAction?: Action;
  moreActions?: Action[];
};

export type PayrollModalLayoutComponentProps = {
  title: string;
  onClose: () => void;
  primaryAction?: Action;
  moreActions?: Action[];
};

export type PayrollLayoutComponent = React.FC<
  React.PropsWithChildren<PayrollLayoutComponentProps>
>;

export type PayrollModalLayoutComponent = React.FC<
  React.PropsWithChildren<PayrollModalLayoutComponentProps>
>;
