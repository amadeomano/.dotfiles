import { screen } from '@testing-library/react';
import { BasicEmployeeSidepanelHeader } from '../BasicEmployeeSidepanelHeader';
import mockRouter from 'next-router-mock';
import { getEmployeeProfileHandlers } from 'payroll/data/preliminary-payroll/handlers';
import { server } from '@personio-web/mocks/server';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import * as React from 'react';
import userEvent from '@testing-library/user-event';

describe('<BasicEmployeeSidepanelHeader/>', () => {
  beforeEach(() => {
    server.use(getEmployeeProfileHandlers.defaultHandler);
  });

  it('should should load and render a link to the employee profile when the employee id is in the url', async () => {
    mockRouter.push('/payroll/personal?period=2024');

    renderWithWrapper(<BasicEmployeeSidepanelHeader employeeId="1234" />);

    const viewProfileButton = await screen.findByRole('button', {
      name: /view profile/i,
    });

    expect(viewProfileButton).toBeVisible();

    userEvent.click(viewProfileButton);

    expect(mockRouter.asPath).toContain('/staff/details/1234');
  });
});
