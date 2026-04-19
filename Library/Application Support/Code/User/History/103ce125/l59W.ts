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

export const payGroups: InfoPicker = {
  list: [
    { key: 'pg1', label: 'Pay Group 1' },
    { key: 'pg2', label: 'Pay Group 2' },
  ],
  onSelect: logAction('payGroups: onSelect'),
  selected: 'pg2',
};

export const tabList: InfoPicker = {
  list: [
    { key: 'tab1', label: 'Payroll runs' },
    { key: 'tab2', label: 'Documents', count: 5 },
  ],
  onSelect: logAction('tabs: onSelect'),
  selected: 'tab1',
};

export const getSchemasFn: PayrollLayoutComponentProps['breadcrumbSchemaFn'] = (
  breadcrumbDepth: number,
) => [
  { label: 'Page Title', id: 'title', isVisible: breadcrumbDepth >= 0 },
  {
    id: 'accountingGroup',
    label: 'Accounting Group',
    isVisible: breadcrumbDepth >= 0,
    dropdownItems: accountingGroups.list.map(({ key, label }) => ({
      label,
      id: key,
      selected: accountingGroups.selected,
      onClick: () => accountingGroups.onSelect(key),
    })),
  },
  {
    id: 'payGroup',
    label: 'Pay Group',
    isVisible: breadcrumbDepth > 0,
    dropdownItems: payGroups.list.map(({ key, label }) => ({
      label,
      id: key,
      onClick: () => payGroups.onSelect(key),
      selected: key === payGroups.selected,
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
