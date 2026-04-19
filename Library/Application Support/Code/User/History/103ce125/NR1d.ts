import { type PayrollLayoutComponentProps } from '../types';

export const getSchemasFn = (
  breadcrumbDepth: number,
): PayrollLayoutComponentProps['breadcrumbSchemaFn'] => [
  { label: title, id: 'title', isVisible: breadcrumbDepth > 0 },
  {
    id: 'legalEntities',
    label: legalEntities?.placeholder ?? '',
    isVisible: legalEntities && breadcrumbDepth > 0,
    dropdownItems: legalEntities?.list.map(({ key, label }) => ({
      label,
      id: key,
      onClick: () => legalEntities.onSelect(key),
      selected: key === legalEntities.selected,
    })),
  },
  {
    id: 'tabs',
    label: tabs?.placeholder ?? '',
    isVisible: tabs && breadcrumbDepth > 1,
    dropdownItems: tabs?.list.map(({ key, label }) => ({
      label,
      id: key,
      onClick: () => tabs.onSelect(key),
      selected: key === tabs.selected,
    })),
  },
];
