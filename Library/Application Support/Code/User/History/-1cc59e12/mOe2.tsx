import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPayrollIntegrationOAuthDetailsHandlers } from 'payroll/data/payroll-integration-oauth/handlers';

import { server } from '@personio-web/mocks/server';

import Authorization from '../Authorization';
import { OAuthWindowEvent } from '../types';
import { customRender } from '../../../../test-setup/utils';
import { XeroSettings } from '../../../XeroSettings';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

const findAuthButton = () =>
  screen.findByRole('button', { name: 'Connect Xero' });
const findRevokeButton = () => screen.findByText('Remove access');

describe('<Authorization/>', () => {
  window.open = jest.fn();
  mockRouter.replace('?legalEntityId=1234');

  it('should render a skeleton while fetching', async () => {
    customRender(<Authorization />);

    expect(
      screen.getByTestId('loading-placeholder-authorization'),
    ).toBeInTheDocument();
  });

  it('should render <AuthStatus/> if authorization is available', async () => {
    customRender(<XeroSettings />);

    const revokeAuthButton = await findRevokeButton();
    expect(revokeAuthButton).toBeVisible();
  });

  it('should render <GrantAccess/> if no authorization is available', async () => {
    console.error = jest.fn();
    server.use(getPayrollIntegrationOAuthDetailsHandlers.notFoundHandler);
    customRender(<XeroSettings />);

    const authButton = await findAuthButton();
    expect(authButton).toBeVisible();
  });

  it('should refresh the auth status after revoking the authorization', async () => {
    console.error = jest.fn();
    server.use(getPayrollIntegrationOAuthDetailsHandlers.defaultHandler);
    customRender(<Authorization />);

    const revokeAuthButton = await findRevokeButton();
    server.use(getPayrollIntegrationOAuthDetailsHandlers.notFoundHandler);
    userEvent.click(revokeAuthButton);

    const authButton = await findAuthButton();
    expect(authButton).toBeVisible();
  });

  it('should refresh the auth status after finishing the authorization', async () => {
    console.error = jest.fn();
    window.open = jest.fn();

    server.use(getPayrollIntegrationOAuthDetailsHandlers.notFoundHandler);
    customRender(<Authorization />);

    const authButton = await findAuthButton();
    server.use(getPayrollIntegrationOAuthDetailsHandlers.defaultHandler);
    userEvent.click(authButton);

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith('https://personio.de', '_blank'),
    );

    // Simulate the completed event from the new tab
    const eventData: OAuthWindowEvent['data'] = {
      type: 'intp.oauth.completed',
      authId: '1',
    };
    window.postMessage(eventData, '*');

    const revokeAuthButton = await findRevokeButton();
    const authorizationSucceededBanner = await screen.findByText(
      'Xero Authorization is complete!',
    );

    expect(revokeAuthButton).toBeVisible();
    expect(authorizationSucceededBanner).toBeVisible();
  });
});
