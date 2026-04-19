import React from 'react';
import { screen } from '@testing-library/react';

import * as configurationAlertUtils from '../components/ConfigurationAlerts/utils';
import * as utils from '../utils/isLegalEntityInitialized';
import AppLayout from '../AppLayout';
import { customRender } from '../../../../test-setup/utils';

const interactionObserverMock = function () {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };
};

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: { legalEntityId: 123, payGroup: 'FIXED' },
    asPath: 'transfer',
  }),
}));

const getConfigurationAlertMock = jest.spyOn(
  configurationAlertUtils,
  'getConfigurationAlert',
);
const isLegalEntityInitializedMock = jest.spyOn(utils, 'isLEInitialized');

const getTransferButton = () =>
  screen.findByRole('button', { name: 'Sync with Xero' });

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

  it('should render the children if a configuration alert exists but the legal entity has not been initialized yet', async () => {
    isLegalEntityInitializedMock.mockReturnValue(false);
    getConfigurationAlertMock.mockReturnValue(
      <section>Configuration Alert</section>,
    );

    customRender(
      <AppLayout>
        <div>This is an exemplary tab</div>
      </AppLayout>,
    );

    const child = screen.getByText('This is an exemplary tab');
    expect(child).toBeInTheDocument();
  });

  it('should not render the children if a configuration alert exists', async () => {
    isLegalEntityInitializedMock.mockReturnValue(true);
    getConfigurationAlertMock.mockReturnValue(
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
    customRender(<AppLayout />, { hasStatelessRouter: true });

    const legalEntitiesSelect = await screen.findByRole('button', {
      name: 'Legal Entity A',
    });
    expect(legalEntitiesSelect).toBeVisible();
  });

  it('should render the transfer button', async () => {
    customRender(<AppLayout />, { hasStatelessRouter: true });

    const transferButton = await getTransferButton();
    expect(transferButton).toBeVisible();
  });

  it('should render the refresh button', async () => {
    customRender(<AppLayout />, { hasStatelessRouter: true });

    await expect(
      screen.findByRole('button', { name: /refresh/i }),
    ).resolves.toBeInTheDocument();
  });
});
