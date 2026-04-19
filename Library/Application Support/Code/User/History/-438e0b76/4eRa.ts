import { renderHook, act } from '@testing-library/react';
import { useParallelMode } from './useParallelMode'; // Adjust the import path as necessary
import { useFetchLegalEntityOnboardingData } from '@personio-web/payroll-data-payroll-me';
import { useGetDefaultHeaders, useWrapQuery } from './temporary/useWrapQuery';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';
import { toaster } from 'designSystem/component/toaster';

// Add official mock module examples once they're created
jest.mock('@personio-web/payroll-data-payroll-me');
jest.mock('./temporary/useWrapQuery');
jest.mock('./usePayrollGbBreadcrumbsNavigation');
jest.mock('designSystem/component/toaster');

describe('useParallelMode', () => {
  const mockUseFetchLegalEntityOnboardingData =
    useFetchLegalEntityOnboardingData as jest.MockedFunction<
      typeof useFetchLegalEntityOnboardingData
    >;
  const mockUseWrapQuery = useWrapQuery as jest.MockedFunction<
    typeof useWrapQuery
  >;
  const mockUseGbNavigation = useGbNavigation as jest.MockedFunction<
    typeof useGbNavigation
  >;
  const mockToasterNotify = toaster.notify as jest.MockedFunction<
    typeof toaster.notify
  >;

  beforeEach(() => {
    mockUseGbNavigation.mockReturnValue({ legalEntityId: '123' });
    mockUseWrapQuery.mockReturnValue({
      data: { mode: 'LIVE', status: 'LIVE_GRANTED' },
      refetch: jest.fn(),
      error: null,
    });
  });

  it('should fetch data when legalEntityId is present', () => {
    const { result } = renderHook(() => useParallelMode());

    expect(result.current.mode).toBe('LIVE');
    expect(result.current.status).toBe('LIVE_GRANTED');
    expect(mockUseWrapQuery().refetch).toHaveBeenCalled();
  });

  it('should not fetch data when legalEntityId is missing', () => {
    mockUseGbNavigation.mockReturnValue({ legalEntityId: '' });
    const { result } = renderHook(() => useParallelMode());

    expect(result.current.mode).toBeUndefined();
    expect(result.current.status).toBeUndefined();
    expect(mockUseWrapQuery().refetch).not.toHaveBeenCalled();
  });

  it('should notify error when there is an error fetching data', () => {
    mockUseWrapQuery.mockReturnValue({
      data: null,
      refetch: jest.fn(),
      error: 'Network error',
    });

    renderHook(() => useParallelMode());

    expect(mockToasterNotify).toHaveBeenCalledWith({
      variant: 'error',
      title: 'Problem fetching parallel mode status',
      description: 'Error: Network error',
      showCloseButton: true,
      duration: 5000,
    });
  });
});
