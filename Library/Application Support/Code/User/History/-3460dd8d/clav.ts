import { useTabNavigator } from './useTabsNavigator';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

describe('useTabNavigator', () => {
  test('should return the correct tab component based on the slug in the router', () => {
    // Set up the mocked router with the "process" tab
    (useRouter as jest.Mock).mockReturnValue(
      createMockRouter({ slug: ['process'] }),
    );

    const { result } = renderHook(() => useTabNavigator());

    expect(result.current.currentTab).toBe('process');
    expect(result.current.TabComponent).toBeDefined(); // You can also check which specific component is returned
  });
});
