import { useMemo } from 'react';
import { useOrgChartPreferencesContext } from '../../../contexts';
import { type CustomisationId } from '../../customs/orgunit';
import {
  type QueryResult,
  type CompleteHierarchyResult,
} from '../../data/types';
import styles from './OrgUnitCard.module.scss';

const BASE_HEIGHT = 118;

export const useCalcOrgUnitCardHeight = (
  completeHierarchyData: QueryResult<CompleteHierarchyResult>,
) => {
  const prefs = useOrgChartPreferencesContext();

  const height = useMemo(() => {
    let calculatedHeight = BASE_HEIGHT;

    if (prefs.cardCustomisations.get<CustomisationId>('description')?.isActive)
      calculatedHeight += parseInt(styles.descriptionHeight);

    const completeHierarchy = completeHierarchyData.data;
    const leadsCount =
      completeHierarchy.source === 'Department' ||
      completeHierarchy.source === 'Team'
        ? completeHierarchy.leadsCount ?? 0
        : 0;

    if (
      leadsCount &&
      prefs.cardCustomisations.get<CustomisationId>('leads')?.isActive
    )
      calculatedHeight +=
        parseInt(styles.leadsMargin) +
        parseInt(styles.leadHeight) * leadsCount +
        parseInt(styles.sectionGapLarge);

    if (
      prefs.cardCustomisations.get<CustomisationId>('abbreviation')?.isActive ||
      prefs.cardCustomisations.get<CustomisationId>('layer')?.isActive
    )
      calculatedHeight +=
        parseInt(styles.abbrLayerHeight) + parseInt(styles.sectionGap);

    return calculatedHeight;
  }, [prefs.cardCustomisations, completeHierarchyData.data]);

  return height;
};
