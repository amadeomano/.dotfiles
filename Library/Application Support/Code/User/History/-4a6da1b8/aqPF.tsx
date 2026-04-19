import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { formatStorybookCallbacks } from '@personio-web/design-system-utils-testing';
import { icons } from 'designSystem/component/icon';
import type { PayrollLayoutComponent, InfoPicker, Action } from '../types';
import { PayrollLayout } from '../PayrollLayout';
import { PayrollSidePanel, SidePanelNavbar } from '../PayrollSidePanel';

const logAction =
  (label: string) =>
  (...args: unknown[]) =>
    formatStorybookCallbacks(action(label))(args);

const legalEntities: InfoPicker = {
  list: [
    { key: 'le1', label: 'Legal Entity 1' },
    { key: 'le2', label: 'Legal Entity 2' },
  ],
  onSelect: logAction('legalEntities: onSelect'),
  selected: 'le1',
};

const tabs: InfoPicker = {
  list: [
    { key: 'tab1', label: 'Payroll runs' },
    { key: 'tab2', label: 'Documents', count: 5 },
  ],
  onSelect: logAction('tabs: onSelect'),
  selected: 'tab1',
};

const primaryAction: Action = {
  title: 'Primary Action',
  onClick: logAction('primaryAction: onClick'),
};

const secondaryAction: Action = {
  title: 'Secondary Action',
  onClick: logAction('secondaryAction: onClick'),
};

const moreActions: Action[] = [
  {
    title: 'Sub action 1',
    onClick: logAction('subAction1: onClick'),
  },
  {
    title: 'Sub action 2',
    onClick: logAction('subAction2: onClick'),
  },
];

const navbar = (
  <SidePanelNavbar
    title="Side Panel"
    hasStepper
    onNext={logAction('navBar: onNext')}
    onPrev={logAction('navBar: onPrev')}
  />
);

const config: Meta<PayrollLayoutComponent> = {
  id: 'payroll-layout',
  title: 'Payroll/Components/Payroll Layout/Layout',
  component: PayrollLayout,
  args: {
    title: 'Payroll',
    legalEntities,
    tabs,
    primaryAction,
    secondaryAction,
    moreActions,
    children: [
      <p style={{ paddingBottom: 1000 }}>Contents</p>,
      <PayrollSidePanel
        isOpen
        onClose={logAction('sidePanel: onClose')}
        navbar={navbar}
      >
        <p>Side Panel Contents</p>
      </PayrollSidePanel>,
    ],
  },
};

export const Default: StoryObj = {};

export default config;
