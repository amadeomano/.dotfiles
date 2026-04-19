import { renderHook, act } from '@testing-library/react-hooks';
import {
  useEmployeeDetailsPanelContext,
  useSyncEmployeeDetailsPanelList,
} from './useEmployeeDetailsPanelContext';
import { EmployeeDetailsPanelContext } from './EmployeeDetailsPanelContext';

describe('useEmployeeDetailsPanelContext', () => {
  it('should throw an error if used outside of EmployeeDetailsPanelContextProvider', () => {
    const { result } = renderHook(() => useEmployeeDetailsPanelContext());
    expect(result.error).toEqual(
      new Error(
        'useEmployeeListNavigatorContext must be used within a EmployeeListNavigatorContextProvider',
      ),
    );
  });

  it('should return context value if used within EmployeeDetailsPanelContextProvider', () => {
    const mockContextValue = { employeeIds: [], setEmployeeIds: jest.fn() };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EmployeeDetailsPanelContext.Provider value={mockContextValue}>
        {children}
      </EmployeeDetailsPanelContext.Provider>
    );

    const { result } = renderHook(() => useEmployeeDetailsPanelContext(), {
      wrapper,
    });
    expect(result.current).toBe(mockContextValue);
  });
});

describe('useSyncEmployeeDetailsPanelList', () => {
  it('should update employeeIds if they are different', () => {
    const mockSetEmployeeIds = jest.fn();
    const mockContextValue = {
      employeeIds: [],
      setEmployeeIds: mockSetEmployeeIds,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EmployeeDetailsPanelContext.Provider value={mockContextValue}>
        {children}
      </EmployeeDetailsPanelContext.Provider>
    );

    const { result } = renderHook(
      () =>
        useSyncEmployeeDetailsPanelList([
          { employeeId: '1' },
          { employeeId: '2' },
        ]),
      { wrapper },
    );

    act(() => {
      result.current;
    });

    expect(mockSetEmployeeIds).toHaveBeenCalledWith(['1', '2']);
  });

  it('should not update employeeIds if they are the same', () => {
    const mockSetEmployeeIds = jest.fn();
    const mockContextValue = {
      employeeIds: ['1', '2'],
      setEmployeeIds: mockSetEmployeeIds,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EmployeeDetailsPanelContext.Provider value={mockContextValue}>
        {children}
      </EmployeeDetailsPanelContext.Provider>
    );

    const { result } = renderHook(
      () =>
        useSyncEmployeeDetailsPanelList([
          { employeeId: '1' },
          { employeeId: '2' },
        ]),
      { wrapper },
    );

    act(() => {
      result.current;
    });

    expect(mockSetEmployeeIds).not.toHaveBeenCalled();
  });
});
