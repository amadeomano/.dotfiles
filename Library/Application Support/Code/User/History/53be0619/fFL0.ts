import { useReducer } from 'react';
import { useRouter } from 'next/router';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { FeatureFlags } from '../../constants/featureFlags';
import type {
  OrgChartPreferencesState,
  OrgChartPreferencesAction,
} from './types';
import { defaultState } from './constants';
import { orgChartPreferencesReducer } from './reducers';
import {
  source,
  focusedNode,
  highlighted,
  filters,
  cardPreferences,
  attributes,
  spotlight,
  spotlightVisibleRelationships,
  cardCustomisations,
  expansionState,
} from './preferences';
import { updateLocalStorage } from './updaters';
import { updateUrlQuery } from './updaters';

export const usePreferencesState = () => {
  const router = useRouter();

  const { isOn: isOrgUnitsFFOn, isReady: isOrgUnitsFFReady } = useFeatureFlag(
    FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART,
  );

  const [state, dispatch] = useReducer(
    (state: OrgChartPreferencesState, action: OrgChartPreferencesAction) =>
      orgChartPreferencesReducer(state, action, router),
    defaultState(),
    () => {
      let initSource = source.getInitialValue(router);

      // If feature flag is off, force source to 'Supervisor'
      if (!isOrgUnitsFFOn || !isOrgUnitsFFReady) {
        initSource = 'Supervisor';
      }

      const initActiveCardId = focusedNode.getInitialValue(router, initSource);
      const initSpotlight = spotlight.getInitialValue(router, initSource);

      const initialState = {
        source: initSource,
        activeCardId: initActiveCardId ?? initSpotlight,
        highlighted: highlighted.getInitialValue(router, initSource),
        filters: filters.getInitialValue(router, initSource),
        /**
         * TODO: [OS-1440] migrate the CardPreferences type to the new customisation type.
         */
        cardPreferences: cardPreferences.getInitialValue(router, initSource),
        cardCustomisations: cardCustomisations.getInitialValue(
          router,
          initSource,
        ),
        attributes: attributes.getInitialValue(router, initSource),
        spotlight: initSpotlight,
        spotlightVisibleRelationships:
          spotlightVisibleRelationships.getInitialValue(router, initSource),
        expansionState: expansionState.getInitialValue(router, initSource),
      };

      updateUrlQuery(initialState, defaultState(initSource), router);
      updateLocalStorage(initialState, defaultState(initSource));
      return initialState;
    },
  );

  return { state, dispatch };
};
