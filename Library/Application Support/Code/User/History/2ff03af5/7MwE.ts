import { useState } from 'react';
import { type OrgChartPreferencesState } from '../../sources/preferences/types';

type BaseViewportRequest = { animated?: boolean | number };
export type ViewportRequest = BaseViewportRequest &
  (
    | { mode: 'resetViewport' }
    | {
        mode: 'fitNode';
        nodeId: string;
        includeChildrenAndParent?: boolean;
        noCentering?: boolean;
      }
  );

// This hook is to be called only once and exposed via the preferences context
export const useRequestViewportState = (prefs: OrgChartPreferencesState) => {
  const [requestedState, requestNewState] = useState<ViewportRequest | null>(
    // Calculate initial state based on the active card id
    () => {
      if (prefs.activeCardId && !prefs.spotlight)
        return {
          mode: 'fitNode',
          nodeId: prefs.activeCardId,
          includeChildrenAndParent: true,
        };

      return { mode: 'resetViewport' };
    },
  );

  return { requestedState, requestNewState };
};
