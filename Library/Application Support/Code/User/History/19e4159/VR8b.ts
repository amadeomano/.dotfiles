import { renderHook } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';
import {
  getActivePayRun,
  navigateToPayRun,
  navigateOutOfPayRun,
  usePayRunNavigator,
} from './usePayRunNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('getActivePayRun', () => {
  it('should return undefined if no active run', () => {
    mockRouter.setCurrentUrl('');
    const getActive = getActivePayRun(mockRouter);
    expect(getActive()).toBeUndefined();
  });

  it('should return the active run if present', () => {
    mockRouter.setCurrentUrl('?active-run=123');
    const getActive = getActivePayRun(mockRouter);
    expect(getActive()).toBe('123');
  });

  it('should return the first active run if it is an array', () => {
    mockRouter.setCurrentUrl('?active-run=123&active-run=456');
    const getActive = getActivePayRun(mockRouter);
    expect(getActive()).toBe('123');
  });
});

describe('navigateToPayRun', () => {
  const pushSpy = jest.spyOn(mockRouter, 'push');
  it('should navigate to a new run if it is different', () => {
    const navigate = navigateToPayRun(mockRouter);
    navigate('123');
    // expect(mockRouter.query).toEqual({
       'active-run': '123' ,
    });
  });

  it('should not navigate if the run is the same', () => {
    mockRouter.setCurrentUrl('?active-run=123');
    const navigate = navigateToPayRun(mockRouter);
    navigate('123');
    expect(pushSpy).not.toHaveBeenCalled();
  });
});

describe('navigateOutOfPayRun', () => {
  const pushSpy = jest.spyOn(mockRouter, 'push');
  it('should remove the active run from query', () => {
    mockRouter.setCurrentUrl('?active-run=123&other=value');
    navigateOutOfPayRun(mockRouter)();
    expect(mockRouter.query).toEqual({ other: 'value' });
  });

  it('should not navigate if there is no active run', () => {
    mockRouter.setCurrentUrl('');
    navigateOutOfPayRun(mockRouter);
    expect(pushSpy).not.toHaveBeenCalled();
  });
});

describe('usePayRunNavigator', () => {
  it('should return the correct functions', () => {
    const { result } = renderHook(() => usePayRunNavigator());
    expect(result.current.getActivePayRun).toBeDefined();
    expect(result.current.navigateToPayRun).toBeDefined();
    expect(result.current.navigateOutOfPayRun).toBeDefined();
  });
});
