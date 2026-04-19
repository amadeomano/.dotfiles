import { server } from '@personio-web/mocks/server';
import { type PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
import { type PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { renderHook, waitFor } from '@testing-library/react';
import assert from 'assert';
import { QueryClient, QueryClientProvider } from 'react-query';
import { getPeopleDataHandlers } from '../handlers';
import { usePeopleData } from '../hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const QueryWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const consoleErrorSpy = jest.spyOn(console, 'error');
const mockIntegration = 'xero';
const mockLegalEntityId = '1234';

describe('usePeopleData', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  type Expectation<
    T extends Exclude<
      PayrollIntegration,
      'addison' | 'paisy' | 'sage50-payroll'
    >,
  > = {
    integration: T;
    expectedObject: PeopleData[T];
  };
  const integrations = [
    {
      integration: 'xero',
      expectedObject: {
        employeeNumber: '123',
        grossSalary: expect.objectContaining({ type: 'FIXED' }),
      },
    } as Expectation<'xero'>,
    {
      integration: 'a3',
      expectedObject: {
        employeeCode: '123',
        office: {
          officeName: 'Office A',
          officeId: '1',
        },
      },
    } as Expectation<'a3'>,
  ];
  it.each(integrations)(
    'should retrieve the %s specific People Data',
    async ({ integration, expectedObject }) => {
      server.use(getPeopleDataHandlers.defaultHandler);

      const { result } = renderHook(
        () => usePeopleData(integration, mockLegalEntityId),
        {
          wrapper: QueryWrapper,
        },
      );

      await waitFor(() => assert(result.current.isSuccess));

      expect(result.current.data).toEqual(
        expect.arrayContaining([expect.objectContaining(expectedObject)]),
      );
    },
  );

  it('should handle failed request', async () => {
    server.use(getPeopleDataHandlers.errorHandler);
    consoleErrorSpy.mockImplementationOnce(() => {
      // No logging
    });

    const { result } = renderHook(() => usePeopleData(mockIntegration, '123'), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => assert(result.current.isError));

    expect(result.current.error).toBeDefined();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
});
