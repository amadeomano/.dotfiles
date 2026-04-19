import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toaster } from 'designSystem/component/toaster';
import { customRender } from '../../test-setup/utils';
import { XeroSettings } from '../XeroSettings';

jest.mock('next/router', () => require('next-router-mock'));
jest.mock('designSystem/component/toaster');

window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('XeroSettings', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should render Authorization', async () => {
    window.open = jest.fn();
    customRender(<XeroSettings />);

    const header = await screen.findByRole('heading', {
      name: 'Authorization',
    });

    expect(header).toBeVisible();
  });

  describe('PayGroup and PayPeriod configuration', () => {
    it('should save when performing changes and clicking submit', async () => {
      customRender(<XeroSettings />);

      await screen.findByRole('heading', { name: 'Pay groups' });

      const groupBySalaryType = screen.getByRole('switch', {
        name: 'Group by salary type',
      });
      userEvent.click(groupBySalaryType);

      // groupBySalaryType is disabled in the defaultHandler, so when we toggle the switch (above) we are now in pay group assignment mode
      const [fixedSalaryPeriodSelection] = await screen.findAllByRole(
        'combobox',
      );
      userEvent.click(fixedSalaryPeriodSelection);

      const monthlyPeriodOption = screen.getByRole('option', {
        name: 'MONTHLY',
      });
      userEvent.click(monthlyPeriodOption);

      const saveButton = screen.getByRole('button', { name: 'Save changes' });
      userEvent.click(saveButton);

      await waitFor(() =>
        expect(toaster.notify).toBeCalledWith({
          variant: 'success',
          title: 'Your changes have been saved successfully!',
        }),
      );
    });

    it('should show a toast when form is invalid and clicking submit', async () => {
      customRender(<XeroSettings />);

      await screen.findByRole('heading', { name: 'Pay groups' });

      const groupBySalaryType = screen.getByRole('switch', {
        name: 'Group by salary type',
      });
      userEvent.click(groupBySalaryType);

      const saveButton = screen.getByRole('button', { name: 'Save changes' });
      userEvent.click(saveButton);

      await waitFor(() =>
        expect(toaster.notify).toBeCalledWith({
          variant: 'default',
          title:
            'You need to assign a pay period calendar to save the configuration.',
        }),
      );
    });
  });
});
