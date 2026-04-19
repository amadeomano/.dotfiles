import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import { customRender } from '../../../test-utils/test-utils';
import Authorization from '../Authorization';
import { server } from '@personio-web/mocks/server';
import {
  getPayrollIntegrationOAuthDetailsHandlers,
  revokePayrollIntegrationOAuthHandlers,
} from '@personio-web/payroll-data-payroll-integration-oauth/src/handlers';
import userEvent from '@testing-library/user-event';
import { OAuthWindowEvent } from '../../GrantAccess/types';
import mockRouter from 'next-router-mock';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(() => ({})),
  useSearchParams: () => [new URLSearchParams({ legalEntityId: '1234' })],
  useNavigate: () => jest.fn(),
}));

jest.mock('next/router', () => require('next-router-mock'));

const findAuthButton = () =>
  screen.findByRole('button', { name: /Connect a3innuva/i });

const findRevokeButton = () =>
  screen.findByRole('button', { name: /Remove access/i });

describe('<Authorization />', () => {
  window.open = jest.fn();
  mockRouter.replace('?legalEntityId=123');

  it('should render a skeleton while fetching', async () => {
    console.error = jest.fn();

    customRender(<Authorization />);

    await expect(
      screen.findByTestId('loading-placeholder-authorization'),
    ).resolves.toBeInTheDocument();
  });

  it('should render <AuthStatus /> if authorization is available', async () => {
    customRender(<Authorization />);

    const revokeAuthButton = await findRevokeButton();
    expect(revokeAuthButton).toBeVisible();
  });

  it('should render <GrantAccess/> if no authorization is available', async () => {
    console.error = jest.fn();
    server.use(getPayrollIntegrationOAuthDetailsHandlers.notFoundHandler);
    customRender(<Authorization />);

    const authButton = await findAuthButton();
    expect(authButton).toBeVisible();
  });

  it('should refresh the auth status after revoking the authorization', async () => {
    console.error = jest.fn();

    server.use(getPayrollIntegrationOAuthDetailsHandlers.defaultHandler);
    customRender(<Authorization />);

    const revokeAuthButton = await findRevokeButton();

    server.use(revokePayrollIntegrationOAuthHandlers.defaultHandler);
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
      'a3innuva Authorization is complete!',
    );

    expect(revokeAuthButton).toBeVisible();
    expect(authorizationSucceededBanner).toBeVisible();
  });
});
