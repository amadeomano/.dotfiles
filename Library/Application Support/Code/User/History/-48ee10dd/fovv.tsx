import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { XeroTransferState } from '@personio-web/payroll-data-payroll-integration-context';
import { postTransferDataHandlers } from '@personio-web/payroll-data-payroll-integration-hub/src/handlers';

import { server } from '@personio-web/mocks/server';
import mockRouter from 'next-router-mock';

import TransferButton from './TransferButton';
import { customRender } from '../../../../../../../test-setup/utils';

jest.mock('next/router', () => require('next-router-mock'));

const getTransferButton = () =>
  screen.getByRole('button', { name: 'Sync with Xero' });

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
      mockRouter.replace('/?legalEntityId=123');
      customRender(<TransferButton />);

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

    it('should open the PayRunDraftExistsDialog when a draft is existing', async () => {
      const mockFn = jest.fn();
      server.use(mockHandler(mockFn));

      customRender(
        <TransferButton
          transferState={{ state: 'PAY_RUN_DRAFT_EXISTS' } as XeroTransferState}
        />,
        {
          initialEntries: ['/?legalEntityId=123'],
        },
      );

      const transferButton = getTransferButton();
      userEvent.click(transferButton);

      const dialogHeading = screen.getByRole('heading', {
        name: 'Sync with Xero',
      });
      const reviewInXeroButton = screen.getByRole('button', {
        name: 'Review in Xero',
      });

      expect(dialogHeading).toBeVisible();
      expect(reviewInXeroButton).toBeVisible();

      await expect(
        waitFor(() => {
          expect(mockFn).toHaveBeenCalled();
        }),
      ).rejects.toThrow();
    });

    it('should show an error toast if the transfer fails', async () => {
      server.use(postTransferDataHandlers.errorHandler);

      customRender(<TransferButton />, {
        initialEntries: [`/?legalEntityId=123`],
      });

      const transferButton = getTransferButton();
      userEvent.click(transferButton);

      await waitFor(async () => {
        const toast = screen.getByText(
          'An error occurred while syncing your data with Xero. Please try again.',
        );
        expect(toast).toBeVisible();
      });
    });
  });
});
