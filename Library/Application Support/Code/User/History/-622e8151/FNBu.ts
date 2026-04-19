import { renderHook, act } from '@testing-library/react-hooks';
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

    const expectedList = hook.tabsDefinition.map(({ route, label }) =>
      // TODO: cover count once it's implemented
      expect.objectContaining({
        key: route,
        label,
      }),
    );

    expect(result.current.list).toEqual(expectedList);
  });

  it('should return the correct selected tab', () => {
    const { result } = renderHook(() => useTabsPicker());

    expect(result.current.selected).toBe('payruns');
  });

  it('should call navigateTo when onSelect is called', () => {
    const { navigateTo } = hook.useTabNavigator();
    const { result } = renderHook(() => useTabsPicker());

    act(() => {
      result.current.onSelect('documents');
    });
    expect(navigateTo).toHaveBeenCalledWith('documents');
  });

  it('should return an empty string if currentTab is null', () => {
    jest.spyOn(hook, 'useTabNavigator').mockReturnValue({
      currentTab: undefined,
      navigateTo: jest.fn(),
      TabComponent: jest.fn(),
    });
    const { result } = renderHook(() => useTabsPicker());

    expect(result.current.selected).toBe('');
  });
});
