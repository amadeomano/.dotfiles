import { renderHook } from '@testing-library/react-hooks';
import nextRouterMock from 'next-router-mock';
import { usePayrunApprovalNavigator } from './usePayrunApprovalNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('usePayrunApprovalNavigator', () => {
  it('should navigate to documents tab', () => {
    getQueryWithNewTab.mockReturnValue({ some: 'newQuery' });
    getQueryWithoutPayRun.mockReturnValue({ some: 'queryWithoutPayRun' });

    const { result } = renderHook(() => usePayrunApprovalNavigator());

    result.current.navigateToDocumentsTab();

    expect(getQueryWithoutPayRun).toHaveBeenCalledWith(queryMock);
    expect(getQueryWithNewTab).toHaveBeenCalledWith(
      { some: 'queryWithoutPayRun' },
      'documents',
    );
    expect(replaceMock).toHaveBeenCalledWith({ query: { some: 'newQuery' } });
  });
});
