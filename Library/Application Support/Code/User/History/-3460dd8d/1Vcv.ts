import { renderHook, act } from '@testing-library/react-hooks';
import { useTabNavigator } from './useTabsNavigator';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

const setRoute = (path: string) => {
  const slug = path.split('/').filter(Boolean);
  mockRouter.setCurrentUrl(path);
  mockRouter.query = { ...mockRouter.query, slug };
};

describe('useTabNavigator', () => {
  test('should return the correct tab component based on the slug in the router', () => {
    setRoute('/process');
    const { result } = renderHook(() => useTabNavigator());

    expect(result.current.currentTab).toBe('process');
    expect(result.current.TabComponent).toBeDefined();
  });

  test('should default to LANDING_TAB if no slug is provided', () => {
    setRoute('/');
    const { result } = renderHook(() => useTabNavigator());

    expect(result.current.currentTab).toBe('personal');
    expect(result.current.TabComponent).toBeDefined();
  });

  test('should default to LANDING_TAB if no valid slug is provided', () => {
    setRoute('/unknown-tab');
    const { result } = renderHook(() => useTabNavigator());

    expect(result.current.currentTab).toBe('personal');
    expect(result.current.TabComponent).toBeDefined();
  });

  test('should call navigateTo with the correct tab', () => {
    setRoute('/process');
    const { result } = renderHook(() => useTabNavigator());
    result.current.navigateTo('documents');

    expect(result.current.currentTab).toBe('documents');
  });
});
