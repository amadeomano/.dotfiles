import { screen } from '@testing-library/react';
import { A3Settings } from '../A3Settings';
import {
  customRender,
  waitForOfficeMappingToBeInitialized,
} from '../test-utils/test-utils';
import { server } from '@personio-web/mocks/server';
import { postA3ConfigurationHandlers } from 'payroll/data/payroll-integration-settings/handlers';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

mockRouter.route = '/?legalEntityId=1';

const legalEntityId = '1';
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();

async function changeCompanyMappingInForm() {
  const [companySelection] = await screen.findAllByRole('combobox');
  userEvent.click(companySelection);

  const companyOption = await screen.findByRole('option', {
    name: 'Company B',
  });
  userEvent.click(companyOption);

  const saveButton = await screen.findByRole('button', { name: 'Save' });
  userEvent.click(saveButton);
}

describe('A3Settings', () => {
  it('should render Authorization', async () => {
    customRender(<A3Settings />, {
      initialEntries: [`?legalEntityId=${legalEntityId}`],
    });

    const header = await screen.findByRole('heading', {
      name: 'Authorization',
    });

    expect(header).toBeVisible();
  });

  it('should show success banner on successfully saving the settings', async () => {
    customRender(<A3Settings />, {
      initialEntries: [`?legalEntityId=${legalEntityId}`],
    });

    await waitForOfficeMappingToBeInitialized();
    await changeCompanyMappingInForm();

    const successToast = await screen.findByText(
      'Your changes have been saved successfully!',
    );
    expect(successToast).toBeVisible();
  });

  it('should show error banner on failing to save the settings', async () => {
    console.error = jest.fn();
    server.use(postA3ConfigurationHandlers.errorHandler);
    customRender(<A3Settings />, {
      initialEntries: [`?legalEntityId=${legalEntityId}`],
    });

    await waitForOfficeMappingToBeInitialized();
    await changeCompanyMappingInForm();

    const errorToast = await screen.findByText(
      /An error occurred while saving your changes./,
    );
    expect(errorToast).toBeVisible();
  });
});
