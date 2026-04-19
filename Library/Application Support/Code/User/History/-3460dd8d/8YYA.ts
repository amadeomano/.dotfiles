import { renderHook, act } from '@testing-library/react-hooks';
import { useTabNavigator } from './useTabsNavigator';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

describe('useTabNavigator', () => {
  test('should return the correct tab component based on the slug in the router', () => {
    mockRouter.replace({ query: { slug: 'process' } });
    const { result } = renderHook(() => useTabNavigator());

    expect(result.current.currentTab).toBe('process');
    expect(result.current.TabComponent).toBeDefined();
  });
});
