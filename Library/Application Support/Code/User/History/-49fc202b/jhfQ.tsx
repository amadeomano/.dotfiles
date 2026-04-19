import { screen, waitFor } from '@testing-library/react';
import { PayrollHub } from '../PayrollHub';
import mockRouter from 'next-router-mock';
import { renderWithWrappers } from '../../testSetup/testHelpers';
import * as authContext from '@personio-web/auth-context';
import { server } from '@personio-web/mocks/server';
import { getPayrollContextSettingsHandlers } from '@personio-web/payroll-data-preliminary-payroll/src/handlers';

jest.mock('next/router', () => require('next-router-mock'));

// Suppress `[MSW] Warning: captured a request without a matching request handler`
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

jest.spyOn(authContext, 'useAuthContext').mockReturnValue({
  companyId: 1234,
  employeeId: 4321,
  entityType: 'employee',
  version: 3,
  userId: '00000000-0000-0000-0000-000000000000',
});

describe('PreliminaryPayroll', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should render content', async () => {
    server.use(getPayrollContextSettingsHandlers.defaultHandler);
    mockRouter.replace('/payroll/personal?period=2024');
    const { rerender } = renderWithWrappers(<PayrollHub />);
    rerender(<PayrollHub />);
    const expectedTabsRoutes = [
      '/payroll/salary',
      '/payroll/absence',
      '/payroll/employee-changes',
      '/payroll/personal',
      '/payroll/documents',
    ];

    const tabList = screen.queryByRole('tablist');
    const tabs = screen.queryAllByRole('tab');
    await waitFor(() =>
      expect(screen.queryByText('Preliminary payroll')).toBeInTheDocument(),
    );

    expect(tabList).toBeInTheDocument();
    expect(tabs).toBeDefined();
    expect(tabs.length).toBe(5);
    tabs.forEach((tab) => {
      const value = tab.getAttribute('value');
      expect(expectedTabsRoutes.includes(value!)).toBeTruthy();
    });
  });

  it.each([
    ['/payroll/personal?period=2024', 'personal-tab', 5],
    ['/payroll/salary?period=2024', 'salary-tab', 5],
    ['/payroll/absence?period=2024', 'absence-tab', 5],
  ])(
    'should render correct tab based on URL: %s',
    (url, expectedTabTestId, expectedTabCount) => {
      server.use(getPayrollContextSettingsHandlers.defaultHandler);
      mockRouter.push(url);

      renderWithWrappers(<PayrollHub />);

      const tabList = screen.queryByRole('tablist');
      const tabs = screen.queryAllByRole('tab');
      expect(tabList).toBeInTheDocument();
      expect(tabs).toBeDefined();
      expect(tabs.length).toBe(expectedTabCount);

      const selectedTab = tabs.find(
        (tab) => tab.getAttribute('aria-selected') === 'true',
      );
      expect(selectedTab).not.toBeNull();
      expect(selectedTab).not.toBeUndefined();

      const expectedTabContent = screen.queryByTestId(expectedTabTestId);
      expect(expectedTabContent).toBeInTheDocument();
    },
  );
});
