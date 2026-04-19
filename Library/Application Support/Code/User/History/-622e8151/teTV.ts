import { renderHook, act } from '@testing-library/react-hooks';
import { useTabsPicker } from './useTabsPicker';
import { useTabNavigator } from '../navigators/useTabsNavigator';
import { tabsDefinition } from '../navigators/useTabsNavigator';

jest.mock('../navigators/useTabsNavigator');

describe('useTabsPicker', () => {
  const mockNavigateTo = jest.fn();
  const mockUseTabNavigator = useTabNavigator as jest.MockedFunction<
    typeof useTabNavigator
  >;

  beforeEach(() => {
    mockUseTabNavigator.mockReturnValue({
      currentTab: 'payruns',
      navigateTo: mockNavigateTo,
      TabComponent: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct list of tabs', () => {
    const { result } = renderHook(() => useTabsPicker());

    const expectedList = tabsDefinition.map(({ route, label }) => ({
      key: route,
      label,
      count: route === 'payruns' ? 10 : undefined,
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
