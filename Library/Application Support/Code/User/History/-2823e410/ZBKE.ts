import { useMemo } from 'react';
import { useOrgChartPreferencesContext } from '../../contexts';
import { type QueryResult, type CompleteHierarchyResult } from '../data/types';
import { useCalcSupervisorCardHeight } from './SupervisorCard/useCalcCardHeight';
import { useCalcOrgUnitCardHeight } from './OrgUnitCard/useCalcCardHeight';

export const useCardHeight = (
  completeHierarchyData: QueryResult<CompleteHierarchyResult>,
) => {
  const prefs = useOrgChartPreferencesContext();

  const supervisorCardHeight = useCalcSupervisorCardHeight();
  const orgUnitCardHeight = useCalcOrgUnitCardHeight(completeHierarchyData);

  const cardHeight = useMemo(() => {
    switch (prefs.source) {
      case 'Supervisor':
        return supervisorCardHeight;
      case 'Department':
      case 'Team':
        return orgUnitCardHeight;
    }
  }, [
    prefs.source,
    prefs.attributes,
    prefs.highlighted,
    prefs.cardCustomisations,
    orgUnitCardHeight,
  ]);

  return cardHeight;
};
