import { renderHook } from '@testing-library/react-hooks';
import nextRouterMock from 'next-router-mock';
import { usePayrunApprovalNavigator } from './usePayrunApprovalNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('usePayrunApprovalNavigator', () => {
  it('should navigate to documents tab', () => {
    nextRouterMock.setCurrentUrl('?some=query');
    const { result } = renderHook(() => usePayrunApprovalNavigator());

    result.current.navigateToDocumentsTab();
    expect(nextRouterMock.query).toBe({ query: { some: 'newQuery' } });
  });
});
