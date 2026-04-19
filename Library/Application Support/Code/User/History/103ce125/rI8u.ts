import { type PayrollLayoutComponentProps } from '../types';

const accountingGroups = [
  { key: 'accountingGroup1', label: 'Accounting Group 1' },
  { key: 'accountingGroup2', label: 'Accounting Group 2' },
];

export const getSchemasFn: PayrollLayoutComponentProps['breadcrumbSchemaFn'] = (
  breadcrumbDepth: number,
) => [
  { label: 'Page Title', id: 'title', isVisible: breadcrumbDepth >= 0 },
  {
    id: 'accountingGroup',
    label: 'Accounting Group',
    isVisible: breadcrumbDepth >= 0,
    dropdownItems: accountingGroups.map(({ key, label }) => ({
      label,
      id: key,
      selected: key === 'accountingGroup1',
    })),
  },
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
