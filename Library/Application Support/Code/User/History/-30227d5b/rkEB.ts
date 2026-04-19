import { act, renderHook } from '@testing-library/react';

import type { OrgChartPreferencesState } from '../../sources/preferences/types';
import {
  useRequestViewportState,
  type ViewportRequest,
} from './useRequestViewportState';

describe('useRequestViewportState', () => {
  describe('initial state', () => {
    it('should initialize with resetViewport when no activeCardId and no spotlight', () => {
      // @ts-expect-error - mock
      const prefs: OrgChartPreferencesState = {
        activeCardId: null,
        spotlight: '',
      };

      const { result } = renderHook(() => useRequestViewportState(prefs));

      expect(result.current.requestedState).toEqual({ mode: 'resetViewport' });
    });

    it('should initialize with fitNode when activeCardId is provided and no spotlight', () => {
      // @ts-expect-error - mock
      const prefs: OrgChartPreferencesState = {
        activeCardId: 'employee-123',
        spotlight: '',
      };

      const { result } = renderHook(() => useRequestViewportState(prefs));

      expect(result.current.requestedState).toEqual({
        mode: 'fitNode',
        nodeId: 'employee-123',
        includeChildrenAndParent: true,
      });
    });

    it('should initialize with resetViewport when spotlight is active regardless of activeCardId', () => {
      // @ts-expect-error - mock
      const prefs: OrgChartPreferencesState = {
        activeCardId: 'employee-123',
        spotlight: 'employee-456',
      };

      const { result } = renderHook(() => useRequestViewportState(prefs));

      expect(result.current.requestedState).toEqual({ mode: 'resetViewport' });
    });
  });

  describe('requestNewState', () => {
    it('should update requestedState when requestNewState is called', () => {
      // @ts-expect-error - mock
      const prefs: OrgChartPreferencesState = {
        activeCardId: null,
        spotlight: '',
      };

      const { result } = renderHook(() => useRequestViewportState(prefs));

      const newRequest: ViewportRequest = {
        mode: 'fitNode',
        nodeId: 'new-employee-id',
        includeChildrenAndParent: false,
        animated: true,
      };

      act(() => {
        result.current.requestNewState(newRequest);
      });

      expect(result.current.requestedState).toEqual(newRequest);
    });

    it('should accept ViewportRequest with noCentering flag set to true', () => {
      // @ts-expect-error - mock
      const prefs: OrgChartPreferencesState = {
        activeCardId: null,
        spotlight: '',
      };

      const { result } = renderHook(() => useRequestViewportState(prefs));

      const requestWithNoCentering: ViewportRequest = {
        mode: 'fitNode',
        nodeId: 'employee-123',
        noCentering: true,
        animated: true,
      };

      act(() => {
        result.current.requestNewState(requestWithNoCentering);
      });

      expect(result.current.requestedState).toEqual(requestWithNoCentering);
    });
  });
});
