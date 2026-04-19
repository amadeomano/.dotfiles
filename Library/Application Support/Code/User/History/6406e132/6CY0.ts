import { useMemo } from 'react';
import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../contexts';
import { type CustomisationId } from '../../customs/orgunit';
import styles from './OrgUnitCard.module.scss';

const BASE_HEIGHT = 118;

export const useCalcOrgUnitCardHeight = () => {
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();

  const height = useMemo(() => {
    let calculatedHeight = BASE_HEIGHT;

    if (prefs.cardCustomisations.get<CustomisationId>('description')?.isActive)
      calculatedHeight += parseInt(styles.descriptionHeight);

    const completeHierarchy = dataSource.completeHierarchyData.data;
    const leadsCount =
      completeHierarchy.source === 'Department' ||
      completeHierarchy.source === 'Team'
        ? completeHierarchy.leadsCount
        : 0;

    if (
      prefs.cardCustomisations.get<CustomisationId>('leads')?.isActive &&
      leadsCount
    )
      calculatedHeight += parseInt(styles.leadHeight) * leadsCount;

    if (
      prefs.cardCustomisations.get<CustomisationId>('abbreviation')?.isActive ||
      prefs.cardCustomisations.get<CustomisationId>('layer')?.isActive
    )
      calculatedHeight += parseInt(styles.abbrLayerHeight);

    return calculatedHeight;
  }, [prefs.cardCustomisations, dataSource.completeHierarchyData.data]);

  return height;
};
