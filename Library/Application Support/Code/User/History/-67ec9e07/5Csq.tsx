import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { formatStorybookCallbacks } from '@personio-web/design-system-utils-testing';
import type { PayrollLayoutComponent, InfoPicker, Action } from '../types';
import { PayrollModalLayout } from '../PayrollModalLayout';
import { PayrollSidePanel, SidePanelNavbar } from '../PayrollSidePanel';

const logAction =
  (label: string) =>
  (...args: unknown[]) =>
    formatStorybookCallbacks(action(label))(args);

const primaryAction: Action = {
  title: 'Primary Action',
  onClick: logAction('primaryAction: onClick'),
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
  id: 'payroll-modal-layout',
  title: 'Payroll/Components/Payroll Layout/Modal Layout',
  component: PayrollLayout,
  args: {
    title: 'Payroll',
    legalEntities,
    tabs,
    primaryAction,
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
