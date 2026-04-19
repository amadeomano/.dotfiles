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
      this.equals(decodeURIComponent(call.toString()), expected),
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
    it('should set the route URL to match the state', () => {
      const handle = handleFilterStateChange(router, false);
      handle && handle({ sorting: { id: 'id', desc: true } });
      expect(router.replace).toBeCalledWithUrl(
        expect.stringContaining('sort=id;desc'),
      );
    });

    it('should set the route sort URL to none when its removed from state', () => {
      const handle = handleFilterStateChange(router, true);
      handle && handle({ sorting: undefined });
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
