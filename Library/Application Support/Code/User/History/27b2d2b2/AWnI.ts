import { renderHook, act } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { useManageTabNavigator } from '../useManageTabNavigator';

jest.mock('next/router', () => require('next-router-mock'));

const setRoute = (path: string) => {
  const slug = path.split('/').filter(Boolean);
  mockRouter.setCurrentUrl(path);
  mockRouter.query = { ...mockRouter.query, slug };
};

describe('useManageTabNavigator', () => {
  it('should return the correct RoutedPage component', () => {
    setRoute('/manage/legal-entity');
    const { result } = renderHook(() => useManageTabNavigator());
    expect(result.current.RoutedPage).toBeDefined();
  });

  it('should correctly identify the selected route', () => {
    setRoute('/manage/legal-entity');
    const { result } = renderHook(() => useManageTabNavigator());
    expect(result.current.isRouteSelected('legal-entity')).toBe(true);
    expect(result.current.isRouteSelected('pay-groups')).toBe(false);
  });

  it('should navigate to the correct route', async () => {
    setRoute('/manage/legal-entity');
    const { result } = renderHook(() => useManageTabNavigator());
    await act(() => result.current.navigateTo('pay-groups'));
    expect(mockRouter.pathname).toBe('/manage/pay-groups');
  });
});
