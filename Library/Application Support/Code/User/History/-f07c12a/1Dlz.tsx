import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import type { PayrollContext } from '@personio-web/payroll-data-payroll-integration-context';
import mockRouter from 'next-router-mock';

import { getConfigurationAlert } from '../utils';
import { customRender } from '../../../../../test-utils/test-utils';
import { A3_CONTEXT } from '../../../../../__mocks__/a3ContextMock';

const TestComponent = ({ context }: { context?: PayrollContext['a3'] }) => {
  return getConfigurationAlert(context);
};

jest.mock('next/router', () => require('next-router-mock'));

describe('getConfigurationAlert', () => {
  it('should not render an alert if the configuration is valid', () => {
    customRender(<TestComponent context={A3_CONTEXT} />);

    const alert = screen.queryByRole('region');
    expect(alert).not.toBeInTheDocument();
  });

  it('should render the UnauthorizedAlert if the legal entity is unauthorized', async () => {
    const context = cloneDeep(A3_CONTEXT);
    context.isAuthorized = false;

    customRender(<TestComponent context={context} />);

    const alert = await screen.findByRole('region');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      /you haven't connected a3innuva to this legal entity/i,
    );
  });

  it('should render the NoCompanyMappedAlert if no company is configured', async () => {
    const context = cloneDeep(A3_CONTEXT);
    context.a3Context.settings.noCompanyMapped = true;

    customRender(<TestComponent context={context} />);

    const alert = await screen.findByRole('region');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      /you haven't connected an a3innuva company/i,
    );
  });

  it('should render the NoWorkplaceMappedAlert if no workplace is configured', async () => {
    const context = cloneDeep(A3_CONTEXT);
    context.a3Context.settings.noWorkplaceMapped = true;

    customRender(<TestComponent context={context} />);

    const alert = await screen.findByRole('region');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      /you haven't connected at least one a3innuva workplace/i,
    );
  });

  it('should navigate to settings when clicking the button', async () => {
    const pushSpy = jest.spyOn(mockRouter, 'push');
    const context = cloneDeep(A3_CONTEXT);
    context.isAuthorized = false;

    mockRouter.replace('?legalEntityId=123');
    customRender(<TestComponent context={context} />);

    const continueInSettingsButton = await screen.findByRole('button', {
      name: 'Continue in settings',
    });
    userEvent.click(continueInSettingsButton);

    expect(pushSpy).toHaveBeenCalledWith(
      '/configuration/payroll-integration/a3?legalEntityId=123',
    );
  });
});
