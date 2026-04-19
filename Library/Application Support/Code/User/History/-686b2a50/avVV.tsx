import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { XeroSettingsForm } from '../../../XeroSettingsForm';
import PayPeriods from '../PayPeriods';
import { renderWithFormProvider } from '../../../../test-setup/utils';

jest.mock('next/router', () => require('next-router-mock'));

describe('<PayPeriodAssignment/>', () => {
  it('should render legal entity assignment when no grouping is active', async () => {
    const { form } = renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);
    act(() => form.setValue('payGroups.groupingActive', false));

    const label = await screen.findByText(
      'This pay period calendar will be assigned to this legal entity',
    );

    expect(label).toBeVisible();
  });

  it('should render pay group assignment when grouping is active', async () => {
    const { form } = renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);
    act(() => form.setValue('payGroups.groupingActive', true));

    const fixedSalary = await screen.findByText('Fixed salary');
    const hourlySalary = screen.getByText('Hourly wage');

    expect(fixedSalary).toBeVisible();
    expect(hourlySalary).toBeVisible();
  });

  it('should render the hourly salary period assignment disabled with a tooltip', async () => {
    const { form } = renderWithFormProvider<XeroSettingsForm>(<PayPeriods />);
    act(() => form.setValue('payGroups.groupingActive', true));

    const [_, hourlyPeriodSelect] = await screen.findAllByRole('combobox');

    expect(hourlyPeriodSelect).toBeDisabled();

    const tooltipWrapper = hourlyPeriodSelect.parentElement;
    userEvent.hover(tooltipWrapper!);

    const tooltip = await screen.findByRole('tooltip', {
      name: /Hourly salary grouping is not yet supported./,
    });
    expect(tooltip).toBeVisible();
  });
});
