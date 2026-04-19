import type {
  ActionProps,
  BreadcrumbSchema,
} from 'designSystem/component/page';

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

export type Action = Omit<ActionProps, 'children'> & {
  title: string;
  isVisible?: boolean;
  onClick: () => void;
};

export type PayrollLayoutComponentProps = {
  title: string;
  legalEntities?: InfoPicker;
  tabs?: InfoPicker;
  primaryAction?: Action;
  secondaryAction?: Action;
  moreActions?: Action[];
  breadcrumbs?: (depth: number) => BreadcrumbSchema;
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
