import { renderHook, act } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';
import * as hook from '../navigators/useTabsNavigator';
import { useTabsPicker } from './useTabsPicker';

jest.mock('next/router', () => require('next-router-mock'));
jest.spyOn(hook, 'useTabNavigator').mockReturnValue({
  currentTab: 'payruns',
  navigateTo: jest.fn(),
  TabComponent: jest.fn(),
});

describe('useTabsPicker', () => {
  it('should return the correct list of tabs', () => {
    const { result } = renderHook(() => useTabsPicker());

    const expectedList = tabsDefinition.map(({ route, label }) => ({
      key: route,
      label,
    }));

    expect(result.current.list).toEqual(expectedList);
  });

  it('should return the correct selected tab', () => {
    const { result } = renderHook(() => useTabsPicker());

    expect(result.current.selected).toBe('home');
  });

  it('should call navigateTo when onSelect is called', () => {
    const { result } = renderHook(() => useTabsPicker());

    act(() => {
      result.current.onSelect('payruns');
    });

    expect(mockNavigateTo).toHaveBeenCalledWith('payruns');
  });

  it('should return an empty string if currentTab is null', () => {
    mockUseTabNavigator.mockReturnValueOnce({
      currentTab: null,
      navigateTo: mockNavigateTo,
    });

    const { result } = renderHook(() => useTabsPicker());

    expect(result.current.selected).toBe('');
  });
});
