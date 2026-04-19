import { renderHook } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';

import { XERO_CONTEXT } from '../../../../../__mocks__/xeroContextMock';
import {
  getAvailablePayGroups,
  usePayGroupsBreadcrumb,
} from '../usePayGroupsBreadcrumb';
import usePayrollHubNavigator from '../../../../../hooks/usePayrollHubNavigator';

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

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: { legalEntityId: 123, payGroup: 'FIXED' },
    replace: jest.fn(),
  }),
}));

describe('getAvailablePayGroups', () => {
  it('returns an empty array when context is undefined', () => {
    const result = getAvailablePayGroups(jest.fn(), undefined);
    expect(result).toEqual([]);
  });

  it('should map pay period mappings to BreadcrumbDropdownItem objects when context is defined', () => {
    const mockNavigate = jest.fn();
    const mockContext = cloneDeep(XERO_CONTEXT);
    mockContext.xeroContext!.settings.payPeriods.groupingActive = true;
    mockContext.xeroContext!.settings.payPeriods.mappings = [
      { attribute: { value: '1', label: 'Pay Period 1' } },
      { attribute: { value: '2', label: 'Pay Period 2' } },
    ];

    const availablePayGroups = getAvailablePayGroups(mockNavigate, mockContext);
    expect(availablePayGroups).toEqual([
      {
        id: '1',
        label: 'Pay Period 1',
        onClick: expect.any(Function),
      },
      {
        id: '2',
        label: 'Pay Period 2',
        onClick: expect.any(Function),
      },
    ]);
  });

  it('should handle case when grouping is not active', () => {
    const mockNavigate = jest.fn();
    const mockContext = cloneDeep(XERO_CONTEXT);
    mockContext.xeroContext!.settings.payPeriods.groupingActive = false;
    mockContext.xeroContext!.settings.payPeriods.mappings = [
      { attribute: { value: '1', label: 'Pay Period 1' } },
      { attribute: { value: '2', label: 'Pay Period 2' } },
    ];

    const availablePayGroups = getAvailablePayGroups(mockNavigate, mockContext);
    expect(availablePayGroups).toEqual([]);
  });
});

describe('usePayGroupsBreadcrumb', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state when context is undefined', () => {
    const { result } = renderHook(() => usePayGroupsBreadcrumb(undefined));
    expect(result.current).toEqual({ loadingWidth: 100 });
  });

  it('should return null when grouping is not active', () => {
    const mockContext = cloneDeep(XERO_CONTEXT);
    mockContext.xeroContext!.settings.payPeriods.groupingActive = false;

    const { result } = renderHook(() => usePayGroupsBreadcrumb(mockContext));
    expect(result.current).toBeNull();
  });

  it('should return null when only one pay group is available', () => {
    const mockContext = cloneDeep(XERO_CONTEXT);
    mockContext.xeroContext!.settings.payPeriods.groupingActive = true;
    mockContext.xeroContext!.settings.payPeriods.mappings = [
      { attribute: { value: '1', label: 'Pay Period 1' } },
    ];

    const { result } = renderHook(() => usePayGroupsBreadcrumb(mockContext));
    expect(result.current).toBeNull();
  });

  it('should select and navigate to the first item, when the payGroup from search does not exist', () => {
    const router = useRouter();
    const mockContext = cloneDeep(XERO_CONTEXT);
    mockContext.xeroContext!.settings.payPeriods.groupingActive = true;
    mockContext.xeroContext!.settings.payPeriods.mappings = [
      { attribute: { value: '1', label: 'Pay Period 1' } },
      { attribute: { value: '2', label: 'Pay Period 2' } },
    ];

    const { result } = renderHook(() => usePayGroupsBreadcrumb(mockContext));

    expect(result.current).toEqual(
      expect.objectContaining({ label: 'Pay Period 1' }),
    );
    expect(router.replace).toBeCalledWithUrl(
      expect.stringContaining('payGroup=1'),
    );
  });

  it('should return the payGroup from search if it exists (and not navigate)', () => {
    const mockContext = cloneDeep(XERO_CONTEXT);
    mockContext.xeroContext!.settings.payPeriods.groupingActive = true;
    mockContext.xeroContext!.settings.payPeriods.mappings = [
      { attribute: { value: '1', label: 'Pay Period 1' } },
      { attribute: { value: '2', label: 'Pay Period 2' } },
      { attribute: { value: 'mockedPayGroup', label: 'Pay Period 3' } },
    ];

    const { result } = renderHook(() => usePayGroupsBreadcrumb(mockContext));

    expect(result.current).toEqual(
      expect.objectContaining({ label: 'Pay Period 3' }),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
