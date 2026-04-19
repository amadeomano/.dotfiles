import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import * as nextRouter from 'next/router';
import type {
  PayrollContext,
  PayrollIntegrationCalendar,
} from '@personio-web/payroll-data-payroll-integration-context';
import mockRouter from 'next-router-mock';

import { getConfigurationAlert } from '../utils';
import { customRender } from '../../../../../../test-setup/utils';
import {
  PAYROLL_INTEGRATION_CALENDAR,
  XERO_CONTEXT,
} from '../../../../../__mocks__/xeroContextMock';

const TestComponent = ({
  context,
  activeCalendar,
}: {
  context?: PayrollContext['xero'];
  activeCalendar?: PayrollIntegrationCalendar;
}) => {
  return getConfigurationAlert(context, activeCalendar);
};

jest.mock('next/router', () => require('next-router-mock'));

describe('getConfigurationAlert', () => {
  it('should not render an alert if the configuration is valid', () => {
    customRender(
      <TestComponent
        context={XERO_CONTEXT}
        activeCalendar={PAYROLL_INTEGRATION_CALENDAR}
      />,
    );

    const alert = screen.queryByRole('region');
    expect(alert).not.toBeInTheDocument();
  });

  it('should render the UnauthorizedAlert if the legal entity is unauthorized', async () => {
    const context = cloneDeep(XERO_CONTEXT);
    context.isAuthorized = false;

    customRender(<TestComponent context={context} />);

    const alert = await screen.findByRole('region');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      /you haven't connected Xero to this legal entity/i,
    );
  });

  it('should render the NoCalendarAssignedBanner if no calendar is configured', async () => {
    customRender(
      <TestComponent context={XERO_CONTEXT} activeCalendar={undefined} />,
    );

    const alert = await screen.findByRole('region');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/you haven't connected a Xero calendar/i);
  });

  it('should navigate to settings when clicking the button', async () => {
    const pushSpy = jest.spyOn(mockRouter, 'push');
    mockRouter.replace('?legalEntityId=123');
    customRender(
      <TestComponent context={XERO_CONTEXT} activeCalendar={undefined} />,
    );

    const continueInSettingsButton = await screen.findByRole('button', {
      name: 'Continue in settings',
    });
    userEvent.click(continueInSettingsButton);

    expect(pushSpy).toHaveBeenCalledWith(
      '/configuration/payroll-integration/xero?legalEntityId=123',
    );
  });
});
