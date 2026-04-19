import { QueryClient, QueryClientProvider } from 'react-query';
import { server } from '@personio-web/mocks/server';
import { renderHook, waitFor } from '@testing-library/react';
import { usePostTransferData } from '../hooks';
import { postTransferDataHandlers } from '../handlers';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
import { TransferResult } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { FC, PropsWithChildren } from 'react';
import assert from 'assert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const QueryWrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const consoleErrorSpy = jest.spyOn(console, 'error');
const mockIntegration = 'xero';
const mockLegalEntityId = '1234';

describe('usePostTransferData', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  type Expectation<T extends PayrollIntegration> = {
    integration: T;
    expectedTransferResult: TransferResult[T];
  };
  const integrations = [
    {
      integration: 'xero',
      expectedTransferResult: {
        createdEmployeeIds: ['1', '2', '3', '4'],
        updatedEmployeeIds: ['5', '6', '7', '8'],
        notCreatedEmployeeIds: [],
        notUpdatedEmployeeIds: [],
        blockingErrors: [],
        failures: {},
        emailsToDisplay: [],
      },
    } as Expectation<'xero'>,
    {
      integration: 'a3',
      expectedTransferResult: {
        createdEmployeeIds: ['11', '22', '33', '44'],
        updatedEmployeeIds: ['55', '66', '77', '88'],
        notCreatedEmployeeIds: [],
        notUpdatedEmployeeIds: [],
        blockingErrors: [],
        failures: {},
      },
    } as Expectation<'a3'>,
  ];
  it.each(integrations)(
    'should transfer the %s specific data with respective transfer results',
    async ({ integration, expectedTransferResult }) => {
      server.use(postTransferDataHandlers.defaultHandler);

      const { result } = renderHook(
        () => usePostTransferData(integration, mockLegalEntityId),
        {
          wrapper: QueryWrapper,
        },
      );

      const successCb = jest.fn();
      result.current.mutate(undefined, { onSuccess: successCb });

      await waitFor(() => assert(result.current.isSuccess));
      expect(successCb).toHaveBeenCalledWith(
        expectedTransferResult,
        undefined,
        undefined,
      );
    },
  );

  it('should handle failed request', async () => {
    server.use(postTransferDataHandlers.errorHandler);
    consoleErrorSpy.mockImplementationOnce(() => {
      // No logging
    });

    const { result } = renderHook(
      () => usePostTransferData(mockIntegration, mockLegalEntityId),
      {
        wrapper: QueryWrapper,
      },
    );

    result.current.mutate(undefined);
    await waitFor(() => assert(result.current.isError));

    expect(result.current.error).toBeDefined();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
});
