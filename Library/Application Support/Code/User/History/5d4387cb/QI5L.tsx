import { server } from '@personio-web/mocks/server';
import { renderHook, waitFor } from '@testing-library/react';
import {
  buildSplitWrapper,
  useFeatureFlag,
} from '@personio-web/use-feature-flag';

import mockRouter from 'next-router-mock';
import { TestWrapper } from '../../testSetup/testHelpers';
import {
  getPayrollContextSettingsHandlers,
  getPayrollIntegrationsHandlers,
} from '@personio-web/payroll-data-preliminary-payroll/src/handlers';
import {
  useSelectActivePayrollIntegration,
  normalizePayrollDataIntegration,
  computeRedirectState,
  useHydrateCurrentIntegrationWithSplit,
} from './useSelectActivePayrollIntegration';
import { useGetPayrollContextSettings } from '@personio-web/payroll-data-preliminary-payroll';
import { useGetPayrollIntegrations } from '@personio-web/payroll-data-preliminary-payroll';
import assert from 'assert';

const mockOpenURL = jest.fn();
const originalOpen = global.open;

describe('useSelectActivePayrollIntegration', () => {
  beforeEach(() => {
    global.open = mockOpenURL;
    jest.clearAllMocks();
    server.resetHandlers();
  });
  afterEach(() => {
    jest.clearAllMocks();
    global.open = originalOpen;
  });

  it('should not redirect in case of non-active payroll integrations', async () => {
    server.use(getPayrollContextSettingsHandlers.defaultHandler);
    server.use(
      getPayrollIntegrationsHandlers.GetPayrollIntegrations200Handler__200NoIntegration,
    );

    mockRouter.push('/payroll');

    const { result: resultContext } = renderHook(
      () => useGetPayrollContextSettings(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result: integrationsResult } = renderHook(
      () => useGetPayrollIntegrations(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result } = renderHook(() => useSelectActivePayrollIntegration(), {
      wrapper: TestWrapper,
    });
    // while the resources is fetching, it shouldn't redirect
    expect(result.current.isContextLoading).toBeTruthy();
    expect(result.current.shouldRedirect).toBeFalsy();

    // guarantees that the test waits for the resources
    await waitFor(() => assert(resultContext.current.isSuccess));
    await waitFor(() => assert(integrationsResult.current.isSuccess));

    await waitFor(() => expect(result.current.isContextLoading).toBeFalsy());
    expect(result.current.isContextLoading).toBeFalsy();
    expect(result.current.shouldRedirect).toBeFalsy();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('should not redirect in case of non-active context integrations', async () => {
    server.use(getPayrollContextSettingsHandlers.defaultHandler);
    server.use(
      getPayrollIntegrationsHandlers.GetPayrollIntegrations200Handler__200NoIntegration,
    );
    mockRouter.push('/payroll');

    const { result: resultContext } = renderHook(
      () => useGetPayrollContextSettings(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result: integrationsResult } = renderHook(
      () => useGetPayrollIntegrations(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result } = renderHook(() => useSelectActivePayrollIntegration(), {
      wrapper: TestWrapper,
    });

    // while the resources is fetching, it shouldn't redirect
    expect(result.current.isContextLoading).toBeTruthy();
    expect(result.current.shouldRedirect).toBeFalsy();

    // guarantees that the test waits for the resources
    await waitFor(() => assert(resultContext.current.isSuccess));
    await waitFor(() => assert(integrationsResult.current.isSuccess));

    await waitFor(() => expect(result.current.isContextLoading).toBeFalsy());
    expect(result.current.isContextLoading).toBeFalsy();
    expect(result.current.shouldRedirect).toBeFalsy();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('should not redirect if has active context integrations and the route was setup', async () => {
    server.use(
      getPayrollContextSettingsHandlers.GetPayrollContextSettings200Handler__200Integration,
    );
    server.use(
      getPayrollIntegrationsHandlers.GetPayrollIntegrations200Handler__200NoIntegration,
    );
    mockRouter.push('/payroll/personal');

    const { result: resultContext } = renderHook(
      () => useGetPayrollContextSettings(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result: integrationsResult } = renderHook(
      () => useGetPayrollIntegrations(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result } = renderHook(() => useSelectActivePayrollIntegration(), {
      wrapper: TestWrapper,
    });

    expect(mockOpenURL).not.toHaveBeenCalled();
    // if it has a subroute, we don't even fall on the loading state
    expect(result.current.isContextLoading).toBeFalsy();
    expect(result.current.shouldRedirect).toBeFalsy();
    // guarantees that the test waits for the resources
    await waitFor(() => assert(resultContext.current.isSuccess));
    await waitFor(() => assert(integrationsResult.current.isSuccess));
    expect(result.current.shouldRedirect).toBeFalsy();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('should redirect if has active context integrations and no route was setup', async () => {
    server.use(
      getPayrollIntegrationsHandlers.GetPayrollIntegrations200Handler__200NoIntegration,
    );
    server.use(
      getPayrollContextSettingsHandlers.GetPayrollContextSettings200Handler__200Integration,
    );
    mockRouter.push('/payroll');

    const { result: resultContext } = renderHook(
      () => useGetPayrollContextSettings(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result: integrationsResult } = renderHook(
      () => useGetPayrollIntegrations(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result } = renderHook(() => useSelectActivePayrollIntegration(), {
      wrapper: TestWrapper,
    });

    // guarantees that the test waits for the resources
    await waitFor(() => assert(resultContext.current.isSuccess));
    await waitFor(() => assert(integrationsResult.current.isSuccess));

    await waitFor(() => expect(result.current.isContextLoading).toBeTruthy());
    expect(result.current.shouldRedirect).toBeTruthy();

    expect(mockOpenURL).toHaveBeenCalled();
  });

  // skipping this file cuz the gitlab detected as a flaky https://gitlab.personio-internal.de/personio/frontend/personio-web/-/jobs/47010496
  // eslint-disable-next-line jest/no-disabled-tests
  it('should redirect if has active payroll integrations and no route was setup', async () => {
    server.use(getPayrollIntegrationsHandlers.defaultHandler);
    server.use(getPayrollContextSettingsHandlers.defaultHandler);
    mockRouter.push('/payroll');
    const { result } = renderHook(() => useSelectActivePayrollIntegration(), {
      wrapper: TestWrapper,
    });

    const { result: resultContext } = renderHook(
      () => useGetPayrollContextSettings(),
      {
        wrapper: TestWrapper,
      },
    );

    const { result: integrationsResult } = renderHook(
      () => useGetPayrollIntegrations(),
      {
        wrapper: TestWrapper,
      },
    );

    // guarantees that the test waits for the resources
    await waitFor(() => assert(resultContext.current.isSuccess));
    await waitFor(() => assert(integrationsResult.current.isSuccess));

    await waitFor(() => expect(result.current.isContextLoading).toBeTruthy());
    await waitFor(() => expect(result.current.shouldRedirect).toBeTruthy());

    expect(mockOpenURL).toHaveBeenCalled();
  });
});

const mockIntegrations = [
  {
    name: 'a3',
    displayName: 'A3 Innuva',
    enabled: false,
  },
  {
    name: 'xero',
    displayName: 'Xero (UK)',
    enabled: false,
  },
  {
    name: 'sage50-payroll',
    displayName: 'Sage 50 Payroll',
    enabled: false,
  },
  {
    name: 'addison',
    displayName: 'ADDISON Lohn & Gehalt',
    enabled: false,
  },
  {
    name: 'paisy',
    displayName: 'ADP Paisy',
    enabled: false,
  },
];

const mockQueryParams = {
  period: '2024-08',
  slug: ['personal'],
};

const mockIntegrationWithEnabled = [
  {
    name: 'addison',
    displayName: 'ADDISON Lohn & Gehalt',
    enabled: true,
  },
  {
    name: 'paisy',
    displayName: 'ADP Paisy',
    enabled: false,
  },
];

describe('useHydrateCurrentIntegrationWithSplit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });
  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });
  it('should hydrate the datev with enabled:true if FF is on', async () => {
    mockRouter.push('/payroll');

    const { result } = renderHook(
      () =>
        useHydrateCurrentIntegrationWithSplit({
          id: 'datev',
          enabled: true,
        }),
      {
        wrapper: buildSplitWrapper({
          'PAYINT-6955-DATEV-O11': 'on',
          'PAYME-101-enable-uk-payroll': 'on',
        }),
      },
    );

    const { result: flagResult } = renderHook(
      () => useFeatureFlag('PAYINT-6955-DATEV-O11'),
      {
        wrapper: buildSplitWrapper({
          'PAYINT-6955-DATEV-O11': 'on',
          'PAYME-101-enable-uk-payroll': 'on',
        }),
      },
    );

    await waitFor(() => assert(flagResult.current.isReady));

    expect(result.current).toStrictEqual({
      id: 'datev',
      enabled: true,
    });
  });

  it('should hydrate the datev with enabled:false if FF is off', async () => {
    mockRouter.push('/payroll');

    const { result } = renderHook(
      () =>
        useHydrateCurrentIntegrationWithSplit({
          id: 'datev',
          enabled: true,
        }),
      {
        wrapper: buildSplitWrapper({
          'PAYINT-6955-DATEV-O11': 'off',
          'PAYME-101-enable-uk-payroll': 'on',
        }),
      },
    );

    const { result: flagResult } = renderHook(
      () => useFeatureFlag('PAYINT-6955-DATEV-O11'),
      {
        wrapper: buildSplitWrapper({
          'PAYINT-6955-DATEV-O11': 'off',
          'PAYME-101-enable-uk-payroll': 'on',
        }),
      },
    );

    await waitFor(() => assert(flagResult.current.isReady));

    expect(result.current).toStrictEqual({
      id: 'datev',
      enabled: false,
    });
  });
});

describe('normalizePayrollDataIntegration', () => {
  it.each([
    [
      [],
      mockIntegrations,
      mockQueryParams,
      [
        { id: 'preliminary', enabled: true },
        { id: 'a3', enabled: false },
        { id: 'xero', enabled: false },
        { id: 'sage50-payroll', enabled: false },
        { id: 'addison', enabled: false },
        { id: 'paisy', enabled: false },
        { id: 'gb', enabled: false },
      ],
    ],
    [
      ['datev'],
      mockIntegrations,
      mockQueryParams,
      [
        { id: 'preliminary', enabled: false },
        { id: 'datev', enabled: true },
        { id: 'a3', enabled: false },
        { id: 'xero', enabled: false },
        { id: 'sage50-payroll', enabled: false },
        { id: 'addison', enabled: false },
        { id: 'paisy', enabled: false },
        { id: 'gb', enabled: false },
      ],
    ],
    [
      [],
      mockIntegrations,
      { ...mockQueryParams, hub: 'gb' },
      [
        { id: 'preliminary', enabled: false },
        { id: 'a3', enabled: false },
        { id: 'xero', enabled: false },
        { id: 'sage50-payroll', enabled: false },
        { id: 'addison', enabled: false },
        { id: 'paisy', enabled: false },
        { id: 'gb', enabled: true },
      ],
    ],
    [
      [],
      mockIntegrationWithEnabled,
      mockQueryParams,
      [
        { id: 'preliminary', enabled: false },
        { id: 'gb', enabled: false },
        { id: 'addison', enabled: true },
        { id: 'paisy', enabled: false },
      ],
    ],
  ])(
    'should normalize the data properly',
    (context, integrations, query, expectedValue) => {
      const normalizedData = normalizePayrollDataIntegration(
        context,
        integrations,
        query,
      );
      expect(normalizedData).toStrictEqual(expectedValue);
    },
  );
});

describe('computeRedirectState', () => {
  it.each([
    // no integrations enabled
    [
      true,
      true,
      false,
      undefined,
      {
        isContextLoading: true,
        shouldRedirect: false,
      },
    ],
    [
      true,
      false,
      false,
      undefined,
      {
        isContextLoading: false,
        shouldRedirect: false,
      },
    ],
    // datev in isLoadingResource: true
    [
      true,
      true,
      false,
      { id: 'datev', enabled: true },
      {
        isContextLoading: true,
        shouldRedirect: false,
      },
    ],
    [
      true,
      false,
      false,
      { id: 'datev', enabled: true },
      {
        isContextLoading: false,
        shouldRedirect: false,
      },
    ],
    [
      false,
      false,
      false,
      { id: 'datev', enabled: false },
      {
        isContextLoading: true,
        shouldRedirect: true,
      },
    ],
  ])(
    'should return the correct redirect state',
    (
      isCurrentIntegrationEnabled,
      isLoadingResource,
      hasSetSlug,
      currentIntegration,
      expectedValue,
    ) => {
      const state = computeRedirectState(
        isCurrentIntegrationEnabled,
        isLoadingResource,
        hasSetSlug,
        currentIntegration as any,
      );

      expect(state).toStrictEqual(expectedValue);
    },
  );
});
