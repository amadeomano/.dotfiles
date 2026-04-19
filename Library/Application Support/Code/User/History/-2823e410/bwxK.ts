import { useMemo } from 'react';
import { useOrgChartPreferencesContext } from '../../contexts';
import { useCalcSupervisorCardHeight } from './SupervisorCard/useCalcCardHeight';
import { useCalcOrgUnitCardHeight } from './OrgUnitCard/useCalcCardHeight';

export const useCardHeight = () => {
  const prefs = useOrgChartPreferencesContext();

  const supervisorCardHeight = useCalcSupervisorCardHeight();
  const orgUnitCardHeight = useCalcOrgUnitCardHeight();

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
  ]);

  return cardHeight;
};
