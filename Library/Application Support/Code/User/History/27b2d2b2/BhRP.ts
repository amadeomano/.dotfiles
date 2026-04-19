import { renderHook } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { useManageTabNavigator } from '../useManageTabNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('useManageTabNavigator', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/manage/legal-entity');
  });

  it('should return the correct RoutedPage component', () => {
    const { result } = renderHook(() => useManageTabNavigator());
    expect(result.current.RoutedPage).toBeDefined();
  });

  it('should correctly identify the selected route', () => {
    const { result } = renderHook(() => useManageTabNavigator());
    expect(result.current.isRouteSelected('legal-entity')).toBe(true);
    expect(result.current.isRouteSelected('pay-groups')).toBe(false);
  });

  it('should navigate to the correct route', () => {
    const { result } = renderHook(() => useManageTabNavigator());
    result.current.navigateTo('pay-groups');
    expect(mockRouter.pathname).toBe('/manage/pay-groups');
  });
});
