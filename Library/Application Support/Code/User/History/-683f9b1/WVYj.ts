import type { ActionProps } from 'designSystem/component/page';

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

export type Action = ActionProps & {
  title: string;
  onClick: () => void;
  isLoading?: boolean;
  isVisible?: boolean;
  isDisabled?: boolean;
};

export type PayrollLayoutComponentProps = {
  title: string;
  legalEntities?: InfoPicker;
  tabs?: InfoPicker;
  primaryAction?: Action;
  secondaryAction?: Action;
  moreActions?: Action[];
};

export type PayrollModalLayoutComponentProps = {
  title: string;
  onClose: () => void;
  primaryAction?: Action;
  secondaryAction?: Action;
  moreActions?: Action[];
};

export type PayrollLayoutComponent = React.FC<
  React.PropsWithChildren<PayrollLayoutComponentProps>
>;

export type PayrollModalLayoutComponent = React.FC<
  React.PropsWithChildren<PayrollModalLayoutComponentProps>
>;
