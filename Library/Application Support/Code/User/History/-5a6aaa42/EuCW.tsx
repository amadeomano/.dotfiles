import React from 'react';
import { screen } from '@testing-library/react';

import { customRender } from '../../../test-utils/test-utils';
import AuthStatus from '../AuthStatus';
import userEvent from '@testing-library/user-event';
import { server } from '@personio-web/mocks/server';
import { revokePayrollIntegrationOAuthHandlers } from '@personio-web/payroll-data-payroll-integration-oauth/src/handlers';
import { PayrollIntegrationOAuthDetails } from '@personio-web/payroll-data-payroll-integration-oauth-types';
import { faker } from '@faker-js/faker';

// jest.mock('react-router-dom', () => ({
//   useLocation: jest.fn(() => ({})),
//   useSearchParams: () => [new URLSearchParams({ legalEntityId: '1234' })],
//   useNavigate: () => jest.fn(),
// }));

jest.mock('next/router', () => require('next-router-mock'));

const findRevokeButton = () =>
  screen.findByRole('button', {
    name: /remove access/i,
  });

const authStatusMock: PayrollIntegrationOAuthDetails = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  email: faker.internet.email(),
  connection_create_date: faker.date.past().toDateString(),
  connection_id: faker.datatype.uuid(),
  tenant_name: faker.company.name(),
  tenant_id: faker.datatype.uuid(),
};

describe('<AuthStatus />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should render the auth details', async () => {
    const status: PayrollIntegrationOAuthDetails = {
      ...authStatusMock,
      connection_create_date: '2023-09-12',
      tenant_name: 'A3 Test Company',
      tenant_id: '1JKL2',
      first_name: 'Bob',
      last_name: 'Tester',
    };
    customRender(<AuthStatus status={status} />);

    const accessGrantedTo = await screen.findByText('A3 Test Company (1JKL2)');
    const accessGrantedBy = await screen.findByText('Bob Tester');
    const accessGrantedOn = await screen.findByText('12 September 2023');

    expect(accessGrantedTo).toBeVisible();
    expect(accessGrantedBy).toBeVisible();
    expect(accessGrantedOn).toBeVisible();
  });

  it('should display revoke button', async () => {
    customRender(<AuthStatus status={authStatusMock} />);

    await expect(findRevokeButton()).resolves.toBeInTheDocument();
  });

  it('should put the revoke button in a loading state while the revocation is pending', async () => {
    expect.assertions(0);
    window.open = jest.fn();
    customRender(<AuthStatus status={authStatusMock} />);

    const revokeButton = await screen.findByRole('button', {
      name: 'Remove access',
    });
    userEvent.click(revokeButton);

    await screen.findByText('loading');
  });

  it('should revoke auth', async () => {
    customRender(<AuthStatus status={authStatusMock} />);

    const revokeAuthButton = await findRevokeButton();
    userEvent.click(revokeAuthButton);

    const feedback = await screen.findByText(/access successfully removed/i);
    expect(feedback).toBeVisible();
  });

  it('should display error if revoke auth failed', async () => {
    console.error = jest.fn();
    server.use(revokePayrollIntegrationOAuthHandlers.errorHandler);

    customRender(<AuthStatus status={authStatusMock} />);

    const revokeAuthButton = await findRevokeButton();
    userEvent.click(revokeAuthButton);

    const feedback = await screen.findByText(/Error when removing access.*/i);
    expect(feedback).toBeVisible();
  });
});
