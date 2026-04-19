import { screen } from '@testing-library/react';

import * as configurationAlertUtils from './components/ConfigurationAlerts/utils';

import AppLayout, { isTransferBlocked } from './AppLayout';
import { customRender } from '../../test-utils/test-utils';
import type { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { FeatureFlag } from '../../types/FeatureFlag';

const interactionObserverMock = function () {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };
};

const getConfigurationAlertMock = jest.spyOn(
  configurationAlertUtils,
  'getConfigurationAlert',
);

describe('isTransferBlocked', () => {
  it('should return false when no people data provided', () => {
    expect(isTransferBlocked()).toBe(false);
  });

  it('should return false if people data has no blockers', () => {
    const peopleData = [{ blockers: [] }] as unknown as PeopleData[];
    expect(isTransferBlocked(peopleData)).toBe(false);
  });

  it('should return true if people data has any blockers', () => {
    const peopleData = [
      { blockers: [] },
      { blockers: [{ message: '' }] },
    ] as unknown as PeopleData[];
    expect(isTransferBlocked(peopleData)).toBe(true);
  });
});

describe('AppLayout', () => {
  beforeEach(() => {
    window.IntersectionObserver = interactionObserverMock as any;
  });

  it('should render the children', async () => {
    customRender(
      <AppLayout>
        <div>This is an exemplary tab</div>
      </AppLayout>,
    );

    const child = screen.getByText('This is an exemplary tab');
    expect(child).toBeVisible();
  });

  it('should not render the children if a configuration alert exists', async () => {
    getConfigurationAlertMock.mockReturnValueOnce(
      <section>Configuration Alert</section>,
    );

    customRender(
      <AppLayout>
        <div>This is an exemplary tab</div>
      </AppLayout>,
    );

    const child = screen.queryByText('This is an exemplary tab');
    expect(child).not.toBeInTheDocument();
  });

  it('should render the legal entity selection', async () => {
    customRender(<AppLayout />);

    const legalEntitiesSelect = await screen.findByRole('button', {
      name: 'Legal Entity A',
    });
    expect(legalEntitiesSelect).toBeVisible();
  });

  it('should render the refresh button', async () => {
    customRender(<AppLayout />);

    const refreshButton = await screen.findByRole('button', {
      name: 'Refresh',
    });
    expect(refreshButton).toBeVisible();
  });
  it('should render the transfer button', async () => {
    customRender(<AppLayout />);

    const transferButton = await screen.findByRole('button', {
      name: 'Transfer to a3innuva',
    });
    expect(transferButton).toBeVisible();
  });

  describe('PayPeriodWidget', () => {
    it('should not render the PayPeriodWidget if the FF is disabled', async () => {
      customRender(<AppLayout />);

      await expect(screen.findByText('Current cycle')).rejects.toThrow();
    });

    it('should render the PayPeriodWidget if the FF is enabled', async () => {
      customRender(<AppLayout />, {
        featureFlags: { [FeatureFlag.ShowPayrollPeriod]: 'on' },
      });

      const widgetTitle = await screen.findByText('Current cycle');
      expect(widgetTitle).toBeVisible();
    });
  });
});
