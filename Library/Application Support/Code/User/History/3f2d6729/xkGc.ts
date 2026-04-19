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

      expect(result.current.state).toBeNull();
    });

    it('should parse compressed query parameter correctly', () => {
      const state: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };
      const compressed = compressToEncodedURIComponent(JSON.stringify(state));

      mockRouter.setCurrentUrl(`/?details=${compressed}`);

      const { result } = renderHook(() => useOrgUnitDetailsState());

      expect(result.current.state).toEqual(state);
    });
  });

  describe('Setting State', () => {
    it('should set department state correctly', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const newState: OrgUnitDetailsState = {
        orgUnitId: 456,
        orgUnitType: 'department',
      };

      await act(async () => await result.current.setState(newState));

      await waitFor(() => {
        expect(result.current.state).toEqual(newState);
      });
    });

    it('should set team state correctly', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const newState: OrgUnitDetailsState = {
        orgUnitId: 789,
        orgUnitType: 'team',
      };

      await act(async () => await result.current.setState(newState));

      await waitFor(() => {
        expect(result.current.state).toEqual(newState);
      });
    });

    it('should clear state when set to null', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      await act(async () => await result.current.setState(state));
      await waitFor(() => expect(result.current.state).toEqual(state));

      await act(async () => await result.current.setState(null));
      await waitFor(() => expect(result.current.state).toBeNull());
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
        await result.current.setState(state);
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
        await result.current.setState(state);
      });

      await waitFor(() => {
        const params = new URLSearchParams(window.location.search);
        expect(params.get('details')).toBeTruthy();
      });

      await act(async () => {
        await result.current.setState(null);
      });

      await waitFor(() => {
        const params = new URLSearchParams(window.location.search);
        expect(params.get('details')).toBeNull();
      });
    });
  });

  describe('setStateWithCallback', () => {
    it('should call callback immediately when no state exists', () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());
      const callback = jest.fn();

      act(() => {
        result.current.setStateWithCallback(null, callback);
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

      await act(async () => await result.current.setState(initState));
      await waitFor(() => expect(result.current.state).toEqual(initState));

      jest.useFakeTimers();

      act(() => result.current.setStateWithCallback(null, callback));
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

      await act(async () => await result.current.setState(initialState));
      await waitFor(() => expect(result.current.state).toEqual(initialState));

      jest.useFakeTimers();

      const newState: OrgUnitDetailsState = {
        orgUnitId: 456,
        orgUnitType: 'team',
      };

      act(() => result.current.setStateWithCallback(newState, callback));
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

      await act(async () => await result.current.setState(initialState));
      await waitFor(() => expect(result.current.state).toEqual(initialState));

      jest.useFakeTimers();

      let cleanup: (() => void) | undefined;
      act(
        () => (cleanup = result.current.setStateWithCallback(null, callback)),
      );

      act(() => cleanup?.());
      act(() => jest.advanceTimersByTime(360));
      expect(callback).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
