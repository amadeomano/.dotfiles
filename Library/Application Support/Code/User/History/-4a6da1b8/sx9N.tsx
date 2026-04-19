import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { formatStorybookCallbacks } from '@personio-web/design-system-utils-testing';
import type { PayrollLayoutComponent, InfoPicker, Action } from './types';

import { PayrollLayout } from './PayrollLayout';

const legalEntities: InfoPicker = {
  list: [
    { key: 'le1', label: 'Legal Entity 1' },
    { key: 'le2', label: 'Legal Entity 2' },
  ],
  onSelect: (key) =>
    formatStorybookCallbacks(action('legalEntities: onSelect'))([key]),
  selected: 'le1',
};

const tabs: InfoPicker = {
  list: [
    { key: 'tab1', label: 'Payroll runs' },
    { key: 'tab2', label: 'Documents', count: 5 },
  ],
  onSelect: (key) => formatStorybookCallbacks(action('tabs: onSelect'))([key]),
  selected: 'tab1',
};

const primaryAction: Action = {
  title: 'Primary Action',
  onClick: () => formatStorybookCallbacks(action('primaryAction: onClick'))([]),
};

const moreActions: Action[] = [
  {
    title: 'Sub action 1',
    onClick: () => formatStorybookCallbacks(action('subAction1: onClick'))([]),
  },
  {
    title: 'Sub action 2',
    onClick: () => formatStorybookCallbacks(action('subAction2: onClick'))([]),
  },
];

const config: Meta<PayrollLayoutComponent> = {
  id: 'payroll-layout',
  title: 'Payroll/Components/Payroll Layout',
  component: PayrollLayout,
  args: {
    title: 'Payroll',
    legalEntities,
    tabs,
    primaryAction,
    moreActions,
    children: <p style={{ paddingBottom: 1000 }}>Contents</p>,
  },
};

export const Default: StoryObj = {};

export default config;
