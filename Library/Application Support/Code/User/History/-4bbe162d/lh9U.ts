import { renderHook } from '@testing-library/react';
import { renderHookWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import mockRouter from 'next-router-mock';
import { usePreferencesState } from '../usePreferencesState';
import { defaultState } from '../constants';
import * as preferences from '../preferences';
import * as updaters from '../updaters';
import { type OrgChartPreferencesState, type Source } from '../types';
import { FeatureFlags } from '../../../constants/featureFlags';

jest.mock('next/router', () => require('next-router-mock'));

jest.mock('../preferences', () => ({
  source: { getInitialValue: jest.fn() },
  focusedNode: { getInitialValue: jest.fn() },
  highlighted: { getInitialValue: jest.fn() },
  filters: { getInitialValue: jest.fn() },
  cardPreferences: { getInitialValue: jest.fn() },
  cardCustomisations: { getInitialValue: jest.fn() },
  attributes: { getInitialValue: jest.fn() },
  spotlight: { getInitialValue: jest.fn() },
  spotlightVisibleRelationships: { getInitialValue: jest.fn() },
  expansionState: { getInitialValue: jest.fn() },
}));

jest.mock('../updaters', () => ({
  updateLocalStorage: jest.fn(),
  updateUrlQuery: jest.fn(),
}));

describe('usePreferencesState', () => {
  it('should return state and dispatch, update url query and local storage', () => {
    const mockInitialSource: Source = 'Department';
    const mockInitialState: OrgChartPreferencesState = {
      source: mockInitialSource,
      activeCardId: 'mock-id',
      highlighted: '',
      filters: [],
      cardPreferences: {
        personalInfo: false,
        avatars: false,
        cardClustering: false,
        openPositions: false,
      },
      cardCustomisations: [],
      attributes: [],
      spotlight: '',
      spotlightVisibleRelationships: [],
      expansionState: [],
    };

    // Mock the initial values
    (preferences.source.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialSource,
    );
    (preferences.focusedNode.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.activeCardId,
    );
    (preferences.highlighted.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.highlighted,
    );
    (preferences.filters.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.filters,
    );
    (preferences.cardPreferences.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.cardPreferences,
    );
    (
      preferences.cardCustomisations.getInitialValue as jest.Mock
    ).mockReturnValue(mockInitialState.cardCustomisations);
    (preferences.attributes.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.attributes,
    );
    (preferences.spotlight.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.spotlight,
    );
    (
      preferences.spotlightVisibleRelationships.getInitialValue as jest.Mock
    ).mockReturnValue(mockInitialState.spotlightVisibleRelationships);
    (preferences.expansionState.getInitialValue as jest.Mock).mockReturnValue(
      mockInitialState.expansionState,
    );

    const { result } = renderHook(() => usePreferencesState());

    expect(result.current.state).toEqual(mockInitialState);
    expect(typeof result.current.dispatch).toBe('function');

    expect(updaters.updateUrlQuery).toHaveBeenCalledWith(
      mockInitialState,
      defaultState(mockInitialSource),
      mockRouter,
    );

    expect(updaters.updateLocalStorage).toHaveBeenCalledWith(
      mockInitialState,
      defaultState(mockInitialSource),
    );
  });

  describe('feature flag behavior', () => {
    it('should force source to Supervisor when feature flag is off', () => {
      const mockInitialSource: Source = 'Department';

      (preferences.source.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialSource,
      );

      const { result } = renderHookWithWrapper(() => usePreferencesState(), {
        features: { [FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART]: 'off' },
      });

      expect(result.current.state.source).toBe('Supervisor');
    });

    it('should allow other sources when feature flag is on', () => {
      const mockInitialSource: Source = 'Department';
      const mockInitialState: OrgChartPreferencesState = {
        source: mockInitialSource,
        activeCardId: 'mock-id',
        highlighted: '',
        filters: [],
        cardPreferences: {
          personalInfo: false,
          avatars: false,
          cardClustering: false,
          openPositions: false,
        },
        cardCustomisations: [],
        attributes: [],
        spotlight: '',
        spotlightVisibleRelationships: [],
        expansionState: [],
      };

      // Mock the initial values
      (preferences.source.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialSource,
      );
      (preferences.focusedNode.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.activeCardId,
      );
      (preferences.highlighted.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.highlighted,
      );
      (preferences.filters.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.filters,
      );
      (
        preferences.cardPreferences.getInitialValue as jest.Mock
      ).mockReturnValue(mockInitialState.cardPreferences);
      (
        preferences.cardCustomisations.getInitialValue as jest.Mock
      ).mockReturnValue(mockInitialState.cardCustomisations);
      (preferences.attributes.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.attributes,
      );
      (preferences.spotlight.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.spotlight,
      );
      (
        preferences.spotlightVisibleRelationships.getInitialValue as jest.Mock
      ).mockReturnValue(mockInitialState.spotlightVisibleRelationships);
      (preferences.expansionState.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.expansionState,
      );

      const { result } = renderHookWithWrapper(() => usePreferencesState(), {
        features: { [FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART]: 'on' },
      });

      // Should respect the original source value when FF is on
      expect(result.current.state.source).toBe('Department');
    });

    it('should force source to Supervisor when feature flag is not ready', () => {
      const mockInitialSource: Source = 'Team';
      const mockInitialState: OrgChartPreferencesState = {
        source: 'Supervisor',
        activeCardId: 'mock-id',
        highlighted: '',
        filters: [],
        cardPreferences: {
          personalInfo: false,
          avatars: false,
          cardClustering: false,
          openPositions: false,
        },
        cardCustomisations: [],
        attributes: [],
        spotlight: '',
        spotlightVisibleRelationships: [],
        expansionState: [],
      };

      // Mock the initial values
      (preferences.source.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialSource,
      );
      (preferences.focusedNode.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.activeCardId,
      );
      (preferences.highlighted.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.highlighted,
      );
      (preferences.filters.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.filters,
      );
      (
        preferences.cardPreferences.getInitialValue as jest.Mock
      ).mockReturnValue(mockInitialState.cardPreferences);
      (
        preferences.cardCustomisations.getInitialValue as jest.Mock
      ).mockReturnValue(mockInitialState.cardCustomisations);
      (preferences.attributes.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.attributes,
      );
      (preferences.spotlight.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.spotlight,
      );
      (
        preferences.spotlightVisibleRelationships.getInitialValue as jest.Mock
      ).mockReturnValue(mockInitialState.spotlightVisibleRelationships);
      (preferences.expansionState.getInitialValue as jest.Mock).mockReturnValue(
        mockInitialState.expansionState,
      );

      // Don't set the feature flag at all (simulating not ready state)
      const { result } = renderHook(() => usePreferencesState());

      // Should be forced to 'Supervisor' when FF is not ready
      expect(result.current.state.source).toBe('Supervisor');
    });
  });
});
