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

    it('should update state when called multiple times', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const firstState: OrgUnitDetailsState = {
        orgUnitId: 100,
        orgUnitType: 'department',
      };

      const secondState: OrgUnitDetailsState = {
        orgUnitId: 200,
        orgUnitType: 'team',
      };

      await act(async () => {
        await result.current[1](firstState);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(firstState);
      });

      await act(async () => {
        await result.current[1](secondState);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(secondState);
      });
    });

    it('should clear state when set to null', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(state);
      });

      await act(async () => {
        await result.current[1](null);
      });

      await waitFor(() => {
        expect(result.current[0]).toBeNull();
      });
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

  describe('Compression and Decompression', () => {
    it('should handle complex state objects', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 123456789,
        orgUnitType: 'department',
      };

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(state);
      });

      // Verify URL was updated with compressed data
      const params = new URLSearchParams(window.location.search);
      expect(params.get('details')).toBeTruthy();
    });

    it('should maintain state consistency across re-renders', async () => {
      const state: OrgUnitDetailsState = {
        orgUnitId: 42,
        orgUnitType: 'team',
      };

      const { result, rerender } = renderHook(() => useOrgUnitDetailsState());

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(state);
      });

      rerender();

      expect(result.current[0]).toEqual(state);
    });
  });

  describe('Edge Cases', () => {
    it('should handle orgUnitId of 0', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 0,
        orgUnitType: 'department',
      };

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(state);
      });
    });

    it('should handle large orgUnitId values', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const state: OrgUnitDetailsState = {
        orgUnitId: 999999999999,
        orgUnitType: 'team',
      };

      await act(async () => {
        await result.current[1](state);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(state);
      });
    });

    it('should handle switching between department and team types', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const departmentState: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      const teamState: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'team',
      };

      await act(async () => {
        await result.current[1](departmentState);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(departmentState);
      });

      await act(async () => {
        await result.current[1](teamState);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(teamState);
      });
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid orgUnitType values', async () => {
      const { result } = renderHook(() => useOrgUnitDetailsState());

      const departmentState: OrgUnitDetailsState = {
        orgUnitId: 123,
        orgUnitType: 'department',
      };

      const teamState: OrgUnitDetailsState = {
        orgUnitId: 456,
        orgUnitType: 'team',
      };

      await act(async () => {
        await result.current[1](departmentState);
      });

      await waitFor(() => {
        expect(result.current[0]?.orgUnitType).toBe('department');
      });

      await act(async () => {
        await result.current[1](teamState);
      });

      await waitFor(() => {
        expect(result.current[0]?.orgUnitType).toBe('team');
      });
    });
  });
});
