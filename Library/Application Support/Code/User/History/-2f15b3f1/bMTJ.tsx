import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { server } from '@personio-web/mocks/server';
import { getPeopleDataHandlers } from '@personio-web/payroll-data-payroll-integration-hub/src/handlers';
import { getLegalEntitiesHandlers } from '@personio-web/payroll-data-payroll-integration-context/src/handlers';
import { XeroPeopleTable, handleFilterStateChange } from '../XeroPeopleTable';
import { Table } from 'designSystem/component/table';
import type { NextRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    replace: jest.fn(),
  }),
}));

jest.mock('designSystem/component/table', () => ({
  ...jest.requireActual('designSystem/component/table'),
  Table: jest.fn(),
}));

expect.extend({
  toBeCalledWithUrl(received, expected) {
    const pass = received.mock.calls.some((call: URL) =>
      this.equals(call.toString(), expected),
    );
    return {
      pass,
      actual: received,
      message: () => `
        Expected: ${this.utils.printExpected(expected)}
        Received: ${this.utils.printReceived(received.mock.calls)}`,
    };
  },
});

const decoratedRender = (element: ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{element}</QueryClientProvider>,
  );
};

describe('handleFilterStateChange', () => {
  const router = { replace: jest.fn() } as unknown as NextRouter;
  describe('when sorting', () => {
    const handle = handleFilterStateChange(router, false);
    it('should set the sort state on the route', () => {
      handle && handle({ sorting: { id: 'id', desc: true } });
      expect(router.replace).toBeCalledWithUrl(
        expect.stringContaining('sort=id;desc'),
      );
    });
  });
});

describe('XeroPeopleTable', () => {
  it('should mount the DS table in loading mode', () => {
    server.use(getPeopleDataHandlers.defaultHandler);
    server.use(getLegalEntitiesHandlers.defaultHandler);
    decoratedRender(<XeroPeopleTable />);
    expect(Table).toBeCalled();
  });
});
