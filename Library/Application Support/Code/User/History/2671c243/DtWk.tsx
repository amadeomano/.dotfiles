import { useMemo, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { type PersonAttribute } from '@personio-web/eo-commons-org-chart-link';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';
import { SavedViews } from 'designSystem/component/saved-views';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { skeletonEdges, skeletonNodes, transitionMaxZoom } from './constants';
import { FeatureFlags } from './constants/featureFlags';
import { ControlBar } from './ControlBar';
import SavedViewsMenu from './ControlBar/components/SavedViews/SavedViewsMenu';
import {
  EmptyStateWithHangingNodes,
  EmptyStateWithoutNodes,
} from './EmptyState';
import { useViewportActions } from './hooks';
import {
  useOrgChartPreferences,
  useOrgChartDataSourceContext,
  OrgChartPreferencesProvider,
  OrgChartDataSourceContextProvider,
  useOrgChartPreferencesContext,
} from './contexts';
import { LayoutProvider } from './layout';
import { OrgChartTree } from './OrgChartTree';
import { nodeTypes } from './OrgChartTree/constants';
import { RemoveFiltersDialog } from './RemoveFiltersDialog';
import { nonInteractiveProps, staticReactFlowProps, Tree } from './TreeLayout';
import { TestIds } from './utils';
import { Viewport } from './Viewport';

import {
  OrgChartUIContextProvider,
  useOrgChartUIContext,
} from './contexts/useOrgChartUIContext';
import styles from './OrgChart.module.scss';

const OrgChartComponent = () => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  const ui = useOrgChartUIContext();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();

  const viewportActions = useViewportActions();

  return (
    <>
      <ControlBar />
      <div className={styles.savedViewsContainer} ref={ui.chartArea}>
        <SavedViews.Root open={ui.isSavedViewsOpen.value}>
          <SavedViews.Siderail overlay>
            <SavedViewsMenu />
          </SavedViews.Siderail>
          {dataSource.isFetching ? (
            <div className={styles.loadingState}>
              <Viewport>
                <Tree
                  {...staticReactFlowProps}
                  {...nonInteractiveProps}
                  nodes={skeletonNodes}
                  edges={skeletonEdges}
                  nodeTypes={nodeTypes}
                  onInit={(instance) =>
                    instance.fitView({ maxZoom: transitionMaxZoom })
                  }
                />
              </Viewport>
            </div>
          ) : dataSource.hasFetchErrors ? (
            <Viewport>
              <div className={styles.emptyState}>
                <EmptyState
                  title={t('generic.title')}
                  description={t('generic.description')}
                  icon={icons.exclamationMarkTriangle}
                  metadata={{ testId: TestIds.ErrorState }}
                />
              </div>
            </Viewport>
          ) : !dataSource.displayableHierarchy.rootNodes.length ? (
            <Viewport>
              <div className={styles.emptyState}>
                {prefs.filters.length &&
                dataSource.completeHierarchyData.data.hiddenRootIds?.length ? (
                  <EmptyStateWithHangingNodes />
                ) : (
                  <EmptyStateWithoutNodes setFilters={prefs.setFilters} />
                )}
              </div>
            </Viewport>
          ) : (
            <OrgChartTree />
          )}
          <RemoveFiltersDialog
            onContinue={(employeeId: string) => {
              prefs.setFilters([]);
              prefs.setSpotlight('');
              const node = dataSource.displayableHierarchy.getNode(employeeId);
              const activeAncestorIds = node?.ancestors.map((anc) => anc.id);
              prefs.setActiveCardId(node?.id ?? null, activeAncestorIds ?? []);
              viewportActions.findAndFocusOnNodeBranch(employeeId);
            }}
          />
        </SavedViews.Root>
      </div>
    </>
  );
};

export const OrgChart = () => {
  const prefs = useOrgChartPreferences();

  const { isOn: isOrgUnitsFFOn } = useFeatureFlag(
    FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART,
  );

  useEffect(() => {
    if (!isOrgUnitsFFOn && prefs.source !== 'Supervisor')
      prefs.setSource('Supervisor');
  }, [isOrgUnitsFFOn, prefs]);

  const visibleAttributeIds: PersonAttribute[] = useMemo(
    () => [
      ...new Set([
        ...(prefs.attributes ?? []),
        ...(prefs.highlighted ? [prefs.highlighted] : []),
      ]),
    ],
    [prefs.attributes, prefs.highlighted],
  );

  return (
    <LayoutProvider visibleAttributeIds={visibleAttributeIds}>
      <OrgChartUIContextProvider>
        <OrgChartPreferencesProvider {...prefs}>
          <OrgChartDataSourceContextProvider>
            <OrgChartComponent />
          </OrgChartDataSourceContextProvider>
        </OrgChartPreferencesProvider>
      </OrgChartUIContextProvider>
    </LayoutProvider>
  );
};
