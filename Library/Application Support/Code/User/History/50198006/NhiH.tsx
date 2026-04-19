import { screen } from '@testing-library/react';
import { getPayCalendarsHandlers } from '@personio-web/payroll-data-payroll-integration-context/src/handlers';

import { server } from '@personio-web/mocks/server';

import { XeroSettingsForm } from '../../../XeroSettingsForm';
import PayPeriods from '../PayPeriods';
import { renderWithFormProvider } from '../../../../test-setup/utils';

jest.mock('next/router', () => require('next-router-mock'));

describe('<PayPeriods/>', () => {
  it('should render PayPeriods Settings', async () => {
    renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);

    const header = await screen.findByRole('heading', {
      name: 'Pay period calendars',
    });

    expect(header).toBeVisible();
  });

  it('should render the calendar skeleton(s) while calendars are still fetching', async () => {
    renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);

    const skeleton = screen.getByTestId('loading-calendars-skeleton');

    expect(skeleton).toBeVisible();
  });

  it('should render the NoCalendarsAvailableBanner if calendars are empty', async () => {
    server.use(getPayCalendarsHandlers.noCalendarsHandler);
    renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);

    const bannerText = await screen.findByText(
      'There was an error retrieving Xero pay period calendars. Please refresh calendars and try again.',
    );

    expect(bannerText).toBeVisible();
  });

  it('should render the NoCalendarsAvailableBanner if there was an error while fetching calendars', async () => {
    console.error = jest.fn();
    server.use(getPayCalendarsHandlers.errorHandler);
    renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);

    const bannerText = await screen.findByText(
      'There was an error retrieving Xero pay period calendars. Please refresh calendars and try again.',
    );

    expect(bannerText).toBeVisible();
  });

  // TODO and to be clarified: if we use form validation, i.e. "This field is required" for the PayPeriod assignments,
  //  we would need at least one additional test to cover that.
  //  this is also related to the FormField component becoming available in the Overhaul
});
