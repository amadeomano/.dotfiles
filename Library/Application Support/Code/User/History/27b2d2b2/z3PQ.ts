import { renderHook } from '@testing-library/react';
import nextRouterMock from 'next-router-mock';
import { useManageTabNavigator } from '../useManageTabNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('useManageTabNavigator', () => {
  beforeEach(() => {
    nextRouterMock.reset();
  });

  it('should return the default route and page when no slug is provided', () => {
    nextRouterMock.setCurrentUrl('/');

    const { result } = renderHook(() => useManageTabNavigator());

    expect(result.current.RoutedPage).toBeDefined();
    expect(result.current.isRouteSelected('legal-entity')).toBe(true);
  });

  it('should return the correct route and page when a valid slug is provided', () => {
    nextRouterMock.setCurrentUrl('/some-valid-slug');

    const { result } = renderHook(() => useManageTabNavigator());

    // Add your assertions here
  });
});
