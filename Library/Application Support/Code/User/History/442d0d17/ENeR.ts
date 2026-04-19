import { renderHook } from '@testing-library/react-hooks';
import nextRouterMock from 'next-router-mock';
import { usePayrunApprovalNavigator } from './usePayrunApprovalNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('usePayrunApprovalNavigator', () => {
  it('should navigate to documents tab', () => {
    nextRouterMock.setCurrentUrl('/payroll/payruns?active-run=123');
    const { result } = renderHook(() => usePayrunApprovalNavigator());

    result.current.navigateToDocumentsTab();
    expect(nextRouterMock.query).toBe({ query: { slug: ['documents'] } });
  });
});
