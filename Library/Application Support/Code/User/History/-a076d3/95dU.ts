import { renderHook, act } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';
import * as employeeDetailsHook from '../contexts/useEmployeeDetailsPanelContext';
import {
  useEmployeeDetailsPanelNavigator,
  useEmployeeDetailsPanelStepperNavigator,
  getHrefForEmployeeDetails,
  getActiveEmployeeId,
  navigateToEmployeeDetails,
  navigateOutOfEmployeeDetails,
  nextEmployeeNavigator,
  previousEmployeeNavigator,
} from './useEmployeeDetailsPanelNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('useEmployeeDetailsPanelNavigator', () => {
  it('should get active employee id', () => {
    mockRouter.setCurrentUrl('?employee=123');
    const { result } = renderHook(() => useEmployeeDetailsPanelNavigator());
    expect(result.current.getActiveEmployeeId()).toBe(123);
  });

  it('should navigate to employee details', () => {
    mockRouter.setCurrentUrl('');
    const { result } = renderHook(() => useEmployeeDetailsPanelNavigator());
    act(() => {
      result.current.navigateToEmployeeDetails(123);
    });
    expect(mockRouter.query).toEqual({ employee: 123 });
  });

  it('should navigate out of employee details', () => {
    mockRouter.setCurrentUrl('?employee=123&other=test');
    const { result } = renderHook(() => useEmployeeDetailsPanelNavigator());
    act(() => {
      result.current.navigateOutOfEmployeeDetails();
    });
    expect(mockRouter.query).toEqual({ other: 'test' });
  });
});

describe('useEmployeeDetailsPanelStepperNavigator', () => {
  jest
    .spyOn(employeeDetailsHook, 'useEmployeeDetailsPanelContext')
    .mockReturnValue({
      employeeIds: [1, 2, 3],
      setEmployeeIds: jest.fn(),
    });

  it('should navigate to next employee', () => {
    mockRouter.setCurrentUrl('?employee=1');
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {result.current.nextNavigator());
    expect(mockRouter.query).toHaveBeenCalledWith({ employee: 2 });
  });

  it('should navigate to previous employee', () => {
    mockRouter.query = { employee: '2' };
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {
      result.current.prevNavigator?.();
    });
    expect(mockPush).toHaveBeenCalledWith({ query: { employee: 1 } });
  });

  it('should not navigate to next employee if on last employee', () => {
    mockRouter.query = { employee: '3' };
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {
      result.current.nextNavigator?.();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not navigate to previous employee if on first employee', () => {
    mockRouter.query = { employee: '1' };
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {
      result.current.prevNavigator?.();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('getHrefForEmployeeDetails', () => {
  it('should return correct href', () => {
    const mockRouter = {
      pathname: '/test',
      query: { other: 'test' },
    };
    const href = getHrefForEmployeeDetails(mockRouter as any, 123);
    expect(href).toBe('/test?other=test&employee=123');
  });
});

describe('getActiveEmployeeId', () => {
  it('should return active employee id', () => {
    const mockRouter = {
      query: { employee: '123' },
    };
    const getId = getActiveEmployeeId(mockRouter as any);
    expect(getId()).toBe(123);
  });

  it('should return undefined if no active employee id', () => {
    const mockRouter = {
      query: {},
    };
    const getId = getActiveEmployeeId(mockRouter as any);
    expect(getId()).toBeUndefined();
  });
});

describe('navigateToEmployeeDetails', () => {
  it('should navigate to employee details', () => {
    const mockPush = jest.fn();
    const mockRouter = {
      query: {},
      push: mockPush,
    };
    const navigate = navigateToEmployeeDetails(mockRouter as any);
    navigate(123);
    expect(mockPush).toHaveBeenCalledWith({ query: { employee: 123 } });
  });
});

describe('navigateOutOfEmployeeDetails', () => {
  it('should navigate out of employee details', () => {
    const mockPush = jest.fn();
    const mockRouter = {
      query: { employee: '123', other: 'test' },
      push: mockPush,
    };
    const navigateOut = navigateOutOfEmployeeDetails(mockRouter as any);
    navigateOut();
    expect(mockPush).toHaveBeenCalledWith({ query: { other: 'test' } });
  });
});

describe('nextEmployeeNavigator', () => {
  it('should return next employee navigator', () => {
    const mockPush = jest.fn();
    const mockRouter = {
      query: { employee: '1' },
      push: mockPush,
    };
    const mockContext = {
      employeeIds: [1, 2, 3],
    };
    const nextNavigator = nextEmployeeNavigator(mockRouter as any, mockContext);
    nextNavigator?.();
    expect(mockPush).toHaveBeenCalledWith({ query: { employee: 2 } });
  });

  it('should return undefined if no next employee', () => {
    const mockRouter = {
      query: { employee: '3' },
    };
    const mockContext = {
      employeeIds: [1, 2, 3],
    };
    const nextNavigator = nextEmployeeNavigator(mockRouter as any, mockContext);
    expect(nextNavigator).toBeUndefined();
  });
});

describe('previousEmployeeNavigator', () => {
  it('should return previous employee navigator', () => {
    const mockPush = jest.fn();
    const mockRouter = {
      query: { employee: '2' },
      push: mockPush,
    };
    const mockContext = {
      employeeIds: [1, 2, 3],
    };
    const prevNavigator = previousEmployeeNavigator(
      mockRouter as any,
      mockContext,
    );
    prevNavigator?.();
    expect(mockPush).toHaveBeenCalledWith({ query: { employee: 1 } });
  });

  it('should return undefined if no previous employee', () => {
    const mockRouter = {
      query: { employee: '1' },
    };
    const mockContext = {
      employeeIds: [1, 2, 3],
    };
    const prevNavigator = previousEmployeeNavigator(
      mockRouter as any,
      mockContext,
    );
    expect(prevNavigator).toBeUndefined();
  });
});
