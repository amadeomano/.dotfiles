import { action } from '@storybook/addon-actions';
import { type PayrollLayoutComponentProps, type InfoPicker } from '../types';
import { formatStorybookCallbacks } from '@personio-web/design-system-utils-testing';

const logAction =
  (label: string) =>
  (...args: unknown[]) =>
    formatStorybookCallbacks(action(label))(args);

const accountingGroups: InfoPicker = {
  list: [
    { key: 'ag1', label: 'Accounting Group 1' },
    { key: 'ag2', label: 'Accounting Group 2' },
  ],
  onSelect: logAction('accountingGroup: onSelect'),
  selected: 'ag1',
};

const payGroups: InfoPicker = {
  list: [
    { key: 'pg1', label: 'Pay Group 1' },
    { key: 'pg2', label: 'Pay Group 2' },
  ],
  onSelect: logAction('payGroups: onSelect'),
  selected: 'pg2',
};

export const getSchemasFn: () => PayrollLayoutComponentProps['breadcrumbSchemaFn'] =
  (breadcrumbDepth: number) => [
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
