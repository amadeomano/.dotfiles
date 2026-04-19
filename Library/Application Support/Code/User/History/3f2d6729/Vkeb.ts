import { renderHook, act, waitFor } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { compressToEncodedURIComponent } from 'lz-string';

import {
  useOrgUnitDetailsState,
  type OrgUnitDetailsState,
} from './useOrgUnitDetailsState';

jest.mock('next/router', () => require('next-router-mock'));

describe('useOrgUnitDetailsState', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return null when no query parameter is present', () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      expect(result.current[0]).toBeNull();
    });

    it('should parse compressed query parameter correctly', () => {
      const state: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };
      const compressed = compressToEncodedURIComponent(JSON.stringify(state));

      mockRouter.setCurrentUrl(`/?details=${compressed}`);

      const { result } = renderHook(() => useOrgUnitDetailsState());

      expect(result.current[0]).toEqual(state);
    });
  });

  describe('Setting State', () => {
    it('should set department state correctly', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const newState: OrgUnitDetailsState = {
        orgUnitId: 456,
        orgUnitType: 'department',
      };

      await act(async () => await result.current[1](newState));

      await waitFor(() => {
        expect(result.current[0]).toEqual(newState);
      });
    });

    it('should set team state correctly', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const newState: OrgUnitDetailsState = {
        orgUnitId: 789,
        orgUnitType: 'team',
      };

      await act(async () => await result.current[1](newState));

      await waitFor(() => {
        expect(result.current[0]).toEqual(newState);
      });
    });

    it('should clear state when set to null', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      await act(async () => await result.current[1](state));
      await waitFor(() => expect(result.current[0]).toEqual(state));

      await act(async () => await result.current[1](null));
      await waitFor(() => expect(result.current[0]).toBeNull());
    });
  });

  describe('Query Parameter Updates', () => {
    it('should update URL with compressed query parameter', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 999,
        orgUnitType: 'department',
      };

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        const params = new URLSearchParams(window.location.search);
        const compressed = params.get('details');
        expect(compressed).toBeTruthy();
      });
    });

    it('should remove query parameter when state is cleared', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'team',
      };

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        const params = new URLSearchParams(window.location.search);
        expect(params.get('details')).toBeTruthy();
      });

      await act(async () => {
        await result.current[1](null);
      });

      await waitFor(() => {
        const params = new URLSearchParams(window.location.search);
        expect(params.get('details')).toBeNull();
      });
    });
  });

  describe('setQueryValueWithCallback', () => {
    it('should call callback immediately when no state exists', () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());
      const callback = jest.fn();

      act(() => {
        result.current[2](null, callback);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should clear state and call callback after animation duration', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());
      const callback = jest.fn();

      const initState: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      await act(async () => await result.current[1](initState));
      await waitFor(() => expect(result.current[0]).toEqual(initState));

      jest.useFakeTimers();

      act(() => result.current[2](null, callback));
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward time by animation duration (360ms)
      act(() => jest.advanceTimersByTime(360));
      expect(callback).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should set new state and call callback after animation duration', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());
      const callback = jest.fn();

      const initialState: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      await act(async () => await result.current[1](initialState));
      await waitFor(() => expect(result.current[0]).toEqual(initialState));

      jest.useFakeTimers();

      const newState: OrgUnitDetailsState = {
        orgUnitId: 456,
        orgUnitType: 'team',
      };

      act(() => result.current[2](newState, callback));
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward time by animation duration (360ms)
      act(() => jest.advanceTimersByTime(360));
      expect(callback).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('should cleanup timeout when cleanup function is called', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());
      const callback = jest.fn();

      const initialState: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      await act(async () => await result.current[1](initialState));
      await waitFor(() => expect(result.current[0]).toEqual(initialState));

      jest.useFakeTimers();

      // Call setQueryValueWithCallback
      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = result.current[2](null, callback);
      });

      // Call cleanup
      act(() => {
        cleanup?.();
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(360);
      });

      // Callback should not be called since timeout was cleared
      expect(callback).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
