import { renderHook, act } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';
import * as employeeDetailsHook from '../contexts/useEmployeeDetailsPanelContext';
import { type EmployeeDetailsPanelContextData } from '../contexts/EmployeeDetailsPanelContext';
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
import { mock } from 'node:test';

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
    act(() => {
      result.current.nextNavigator?.();
    });
    expect(mockRouter.query).toEqual({ employee: 2 });
  });

  it('should navigate to previous employee', () => {
    mockRouter.setCurrentUrl('?employee=2');
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {
      result.current.prevNavigator?.();
    });
    expect(mockRouter.query).toEqual({ employee: 1 });
  });

  it('should not navigate to next employee if on last employee', () => {
    mockRouter.setCurrentUrl('?employee=3');
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {
      result.current.nextNavigator?.();
    });
    expect(mockRouter.query).toEqual({ employee: 3 });
  });

  it('should not navigate to previous employee if on first employee', () => {
    mockRouter.setCurrentUrl('?employee=1');
    const { result } = renderHook(() =>
      useEmployeeDetailsPanelStepperNavigator(),
    );
    act(() => {
      result.current.prevNavigator?.();
    });
    expect(mockRouter.query).toEqual({ employee: 1 });
  });
});

describe('getHrefForEmployeeDetails', () => {
  it('should return correct href', () => {
    mockRouter.setCurrentUrl('/test?other=test');
    const href = getHrefForEmployeeDetails(mockRouter, 123);
    expect(href).toBe('/test?other=test&employee=123');
  });
});

describe('getActiveEmployeeId', () => {
  it('should return active employee id', () => {
    mockRouter.setCurrentUrl('?employee=123');
    const getId = getActiveEmployeeId(mockRouter as any);
    expect(getId()).toBe(123);
  });

  it('should return undefined if no active employee id', () => {
    mockRouter.setCurrentUrl('');
    const getId = getActiveEmployeeId(mockRouter as any);
    expect(getId()).toBeUndefined();
  });
});

describe('navigateToEmployeeDetails', () => {
  it('should navigate to employee details', () => {
    mockRouter.setCurrentUrl('');
    navigateToEmployeeDetails(mockRouter)(123);
    expect(mockRouter.query).toEqual({ employee: 123 });
  });
});

describe('navigateOutOfEmployeeDetails', () => {
  it('should navigate out of employee details', () => {
    mockRouter.setCurrentUrl('?employee=123&other=test');
    navigateOutOfEmployeeDetails(mockRouter)();
    expect(mockRouter.query).toEqual({ other: 'test' });
  });
});

describe('nextEmployeeNavigator', () => {
  it('should return next employee navigator', () => {
    mockRouter.setCurrentUrl('?employee=1');
    const mockContext: EmployeeDetailsPanelContextData = {
      employeeIds: [1, 2, 3],
      setEmployeeIds: jest.fn(),
    };
    nextEmployeeNavigator(mockRouter, mockContext)();
    expect(mockRouter.query).toEqual({ employee: 2 });
  });

  it('should return undefined if no next employee', () => {
    const mockContext: EmployeeDetailsPanelContextData = {
      employeeIds: [1, 2, 3],
      setEmployeeIds: jest.fn(),
    };
    const nextNavigator = nextEmployeeNavigator(mockRouter, mockContext);
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
