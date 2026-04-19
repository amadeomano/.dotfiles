import { QueryClient, QueryClientProvider } from 'react-query';
import { server } from '@personio-web/mocks/server';
import { renderHook, waitFor } from '@testing-library/react';
import { usePayrollContextData } from '../hooks';
import { getPayrollContextHandlers } from '../handlers';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
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

describe('usePayrollContextData', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  const integrations: PayrollIntegration[] = ['xero', 'a3'];
  it.each(integrations)(
    'should retrieve the %s specific Payroll Context data',
    async (integration: PayrollIntegration) => {
      server.use(getPayrollContextHandlers.defaultHandler);

      const { result } = renderHook(
        () => usePayrollContextData(integration, mockLegalEntityId),
        {
          wrapper: QueryWrapper,
        },
      );

      await waitFor(() => assert(result.current.isSuccess));

      expect(result.current.data).toHaveProperty(`${integration}Context`);
    },
  );

  describe('Xero specific', () => {
    it('should retrieve Xero Payroll Context transfer not allowed data', async () => {
      server.use(
        getPayrollContextHandlers.xeroContextTransferNotAllowedHandler,
      );

      const { result } = renderHook(
        () => usePayrollContextData('xero', mockLegalEntityId),
        {
          wrapper: QueryWrapper,
        },
      );

      await waitFor(() => assert(result.current.isSuccess));

      expect(result.current.data).toHaveProperty('xeroContext');
      expect(result.current.data?.xeroContext?.transfer).toEqual(
        expect.objectContaining({ state: 'PAY_RUN_DRAFT_EXISTS' }),
      );
    });
  });

  it('should handle failed request', async () => {
    server.use(getPayrollContextHandlers.errorHandler);
    consoleErrorSpy.mockImplementationOnce(() => {
      // No logging
    });

    const { result } = renderHook(
      () => usePayrollContextData(mockIntegration, mockLegalEntityId),
      {
        wrapper: QueryWrapper,
      },
    );

    await waitFor(() => assert(result.current.isError));

    expect(result.current.error).toBeDefined();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
});
