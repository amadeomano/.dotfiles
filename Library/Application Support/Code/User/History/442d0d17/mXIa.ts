import { renderHook } from '@testing-library/react-hooks';
import nextRouterMock from 'next-router-mock';
import { usePayrunApprovalNavigator } from './usePayrunApprovalNavigator';

const {
  getQueryWithNewTab,
} = require('../../../hooks/navigators/useTabsNavigator');
const {
  getQueryWithoutPayRun,
} = require('../../../hooks/navigators/usePayRunNavigator');

jest.mock('next/router', () => require('next-router-mock'));

jest.mock('../../../hooks/navigators/useTabsNavigator', () => ({
  getQueryWithNewTab: jest.fn(),
}));

jest.mock('../../../hooks/navigators/usePayRunNavigator', () => ({
  getQueryWithoutPayRun: jest.fn(),
}));

describe('usePayrunApprovalNavigator', () => {
  const replaceMock = jest.fn();
  const queryMock = { some: 'query' };

  beforeEach(() => {
    nextRouterMock.useRouter().replace = replaceMock;
    nextRouterMock.useRouter().query = queryMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
