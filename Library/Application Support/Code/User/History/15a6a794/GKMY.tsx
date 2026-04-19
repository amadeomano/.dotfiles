import { screen } from '@testing-library/react';
import type { PayrollIntegrationCalendar } from '@personio-web/payroll-data-payroll-integration-context';
import { getLegalEntitiesHandlers } from '@personio-web/payroll-data-payroll-integration-context/src/handlers';

import { server } from '@personio-web/mocks/server';

import { XeroSettingsForm } from '../../../XeroSettingsForm';
import AssignToLegalEntity from '../AssignToLegalEntity';
import { renderWithFormProvider } from '../../../../test-setup/utils';

jest.mock('next/router', () => require('next-router-mock'));

describe('<AssignToLegalEntity/>', () => {
  const calendars: PayrollIntegrationCalendar[] = [];

  it('should render the name of the active legal entity', async () => {
    server.use(getLegalEntitiesHandlers.defaultHandler);

    renderWithFormProvider<XeroSettingsForm>(
      <AssignToLegalEntity calendars={calendars} />,
    );

    const legalEntityLabel = await screen.findByText('Legal Entity A');

    expect(legalEntityLabel).toBeVisible();
  });
});
