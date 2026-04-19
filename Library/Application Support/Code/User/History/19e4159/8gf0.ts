import mockRouter from 'next-router-mock';
import {
  getActivePayRun,
  navigateToPayRun,
  navigateOutOfPayRun,
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
  it('should navigate to a new run if it is different', () => {
    const navigate = navigateToPayRun(mockRouter);
    const pushSpy = jest.spyOn(mockRouter, 'push');
    navigate('123');
    expect(pushSpy).toHaveBeenCalledWith({
      query: { 'active-run': '123' },
    });
  });

  it('should not navigate if the run is the same', () => {
    mockRouter.setCurrentUrl('?active-run=123');
    const pushSpy = jest.spyOn(mockRouter, 'push');
    const navigate = navigateToPayRun(mockRouter);
    navigate('123');
    expect(pushSpy).not.toHaveBeenCalled();
  });
});

describe('navigateOutOfPayRun', () => {
  it('should remove the active run from query', () => {
    mockRouter.setCurrentUrl('?active-run=123&other=value');
    const pushSpy = jest.spyOn(mockRouter, 'push');
    const navigateOut = navigateOutOfPayRun(mockRouter);
    navigateOut();
    expect(mockRouter.push).toHaveBeenCalledWith({
      query: { other: 'value' },
    });
  });

  it('should not navigate if there is no active run', () => {
    const navigateOut = navigateOutOfPayRun(mockRouter);
    navigateOut();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

describe('usePayRunNavigator', () => {
  it('should return the correct functions', () => {
    const useRouter = require('next/router').useRouter;
    useRouter.mockReturnValue(mockRouter);

    const navigator = usePayRunNavigator();
    expect(navigator.getActivePayRun).toBeDefined();
    expect(navigator.navigateToPayRun).toBeDefined();
    expect(navigator.navigateOutOfPayRun).toBeDefined();
  });
});
