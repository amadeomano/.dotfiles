import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { postTransferDataHandlers } from 'payroll/data/payroll-integration-hub/handlers';

import { server } from '@personio-web/mocks/server';
import mockRouter from 'next-router-mock';

import TransferButton from './TransferButton';
import { customRender } from '../../../../../../test-utils/test-utils';

jest.mock('next/router', () => require('next-router-mock'));

const getTransferButton = () =>
  screen.getByRole('button', { name: 'Transfer to a3innuva' });

const mockHandler = (mockFn: (...args: unknown[]) => void) =>
  rest.post('/api/v1/payroll/integrations/executions', (req, res, ctx) => {
    mockFn();
    return res(ctx.delay(), ctx.status(200));
  });

describe('TransferButton', () => {
  it('should render the button', async () => {
    customRender(<TransferButton />);

    const transferButton = getTransferButton();
    expect(transferButton).toBeInTheDocument();
  });

  describe('legalEntityId query parameter', () => {
    it('should disable the button when does not exist', async () => {
      customRender(<TransferButton />);

      const transferButton = getTransferButton();
      expect(transferButton).toBeDisabled();
    });

    it('should enable the button when exists', async () => {
      customRender(<TransferButton />);
      mockRouter.replace('?legalEntityId=123');

      const transferButton = getTransferButton();
      expect(transferButton).toBeEnabled();
    });
  });

  describe('props', () => {
    it('should disable the button when configurationInvalid is true', async () => {
      customRender(<TransferButton configurationInvalid />);

      const transferButton = getTransferButton();
      expect(transferButton).toBeDisabled();
    });

    it('should disable the button when isTransferBlocked is true', async () => {
      customRender(<TransferButton isTransferBlocked />);

      const transferButton = getTransferButton();
      expect(transferButton).toBeDisabled();
    });
  });

  describe('when clicking the button', () => {
    it('should trigger the transfer network call', async () => {
      const mockFn = jest.fn();
      server.use(mockHandler(mockFn));

      customRender(<TransferButton />, {
        initialEntries: [`/?legalEntityId=123`],
      });

      const transferButton = getTransferButton();
      userEvent.click(transferButton);

      await waitFor(() => expect(mockFn).toHaveBeenCalled());
    });

    it('should open the TransferActiveDialog', async () => {
      server.use(postTransferDataHandlers.defaultHandler);

      customRender(<TransferButton />, {
        initialEntries: [`/?legalEntityId=123`],
      });

      const transferButton = getTransferButton();
      userEvent.click(transferButton);

      await waitFor(() => {
        const dialogTitle = screen.getByRole('heading', {
          name: 'Transferring employee data',
        });
        expect(dialogTitle).toBeVisible();
      });
    });

    it('should open the TransferResultsDialog once the API returns', async () => {
      server.use(postTransferDataHandlers.defaultHandler);

      customRender(<TransferButton />, {
        initialEntries: [`/?legalEntityId=123`],
      });

      const transferButton = getTransferButton();
      userEvent.click(transferButton);

      await waitFor(async () => {
        const dialogTitle = screen.getByRole('heading', {
          name: 'Transferring employee data',
        });
        expect(dialogTitle).toBeVisible();
      });

      await waitFor(() => {
        const transferResultDialogTitle = screen.getByRole('heading', {
          name: 'Transfer complete',
        });
        expect(transferResultDialogTitle).toBeVisible();
      });
    });

    it('should show an error toast if the transfer fails', async () => {
      console.error = jest.fn();
      server.use(postTransferDataHandlers.errorHandler);

      customRender(<TransferButton />, {
        initialEntries: [`/?legalEntityId=123`],
      });

      const transferButton = getTransferButton();
      userEvent.click(transferButton);

      await waitFor(async () => {
        const toast = screen.getByText(
          'An unknown error occurred. Please try again or reach out to us if this persists.',
        );
        expect(toast).toBeVisible();
      });
    });
  });
});
