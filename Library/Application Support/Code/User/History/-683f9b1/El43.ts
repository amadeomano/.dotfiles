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
  isOpen?: boolean;
  onClick: () => void;
};

export type PayrollLayoutComponentProps = {
  title: string;
  legalEntities?: InfoPicker;
  tabs?: InfoPicker;
  primaryAction?: Action;
  moreActions?: Action[];
};

export type PayrollModalLayoutComponentProps = PayrollLayoutComponentProps & {
  onClose: () => void;
};

export type PayrollLayoutComponent = React.FC<
  React.PropsWithChildren<PayrollLayoutComponentProps>
>;

export type PayrollModalLayoutComponent = React.FC<
  React.PropsWithChildren<PayrollModalLayoutComponentProps>
>;
