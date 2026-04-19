import React from 'react';
import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PayrollIntegrationOAuthDetails } from '@personio-web/payroll-data-payroll-integration-oauth-types';

import AuthStatus from '../AuthStatus';
import { customRender } from '../../../../test-setup/utils';

jest.mock('next/router', () => require('next-router-mock'));

const authStatusMock: PayrollIntegrationOAuthDetails = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  email: faker.internet.email(),
  connection_create_date: faker.date.past().toDateString(),
  connection_id: faker.datatype.uuid(),
  tenant_name: faker.company.name(),
  tenant_id: faker.datatype.uuid(),
};

describe('<AuthStatus/>', () => {
  it('should render the auth details', async () => {
    const status: PayrollIntegrationOAuthDetails = {
      ...authStatusMock,
      connection_create_date: '2023-09-12',
      tenant_name: 'Xero Test Company',
      first_name: 'Bob',
      last_name: 'Tester',
    };
    customRender(<AuthStatus status={status} />);

    const accessGrantedTo = screen.getByText('Xero Test Company');
    const accessGrantedBy = screen.getByText('Bob Tester');
    const accessGrantedOn = screen.getByText('12 September 2023');

    expect(accessGrantedTo).toBeVisible();
    expect(accessGrantedBy).toBeVisible();
    expect(accessGrantedOn).toBeVisible();
  });

  it('should put the revoke button in a loading state while the revocation is pending', async () => {
    window.open = jest.fn();
    customRender(<AuthStatus status={authStatusMock} />);

    const revokeButton = await screen.findByRole('button', {
      name: 'Remove access',
    });
    userEvent.click(revokeButton);

    await screen.findByText('loading');
  });
});
