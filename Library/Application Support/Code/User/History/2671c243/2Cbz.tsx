import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import type { PersonAttribute } from '@personio-web/employees-organizations-util-people';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';
import { toaster } from 'designSystem/component/toaster';

import { skeletonEdges, skeletonNodes, transitionMaxZoom } from './constants';
import { ControlBar } from './ControlBar';
import {
  EmptyStateWithHangingNodes,
  EmptyStateWithoutNodes,
} from './EmptyState';
import {
  OrgChartDataSourceContextProvider,
  OrgChartPreferencesProvider,
  PersonCardDataLoaderProvider,
  PositionCardDataLoaderProvider,
  useGetAdditionalSupervisorAttributes,
  useOrgChartPreferences,
  useOrgChartDataSourceContext,
  useViewportActions,
} from './hooks';
import { OrgChartTree } from './OrgChartTree';
import { nodeTypes } from './OrgChartTree/constants';
import { RemoveFiltersDialog } from './RemoveFiltersDialog';
import {
  nonInteractiveProps,
  staticReactFlowProps,
  Tree,
  TreeLayoutProvider,
} from './TreeLayout';
import { type OrgChartPreferences } from './types';
import { TestIds } from './utils';
import { Viewport } from './Viewport';

import styles from './OrgChart.module.scss';

type OrgChartComponentProps = OrgChartPreferences & {
  loading?: boolean;
  additionalSupervisorAttributes?: Record<string, string>;
};

const OrgChartComponent = ({
  filters,
  setFilters,
  setView,
  setSearchTerm,
  setFocusedEmployeeId,
  setSpotlight,
  searchTerm,
  attributes,
  highlighted,
  focusedEmployeeId,
  spotlight,
  spotlightVisibleRelationships,
  cardPreferences,
  additionalSupervisorAttributes,
  ...props
}: OrgChartComponentProps) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  const { openDialog } = useDialogContext();
  const dataSource = useOrgChartDataSourceContext();

  const additionalAttribs = useGetAdditionalSupervisorAttributes();
  // const viewportActions = useViewportActions();

  return (
    <>
      <ControlBar
        {...props}
        cardPreferences={cardPreferences}
        attributes={attributes}
        highlighted={highlighted}
        spotlight={spotlight}
        spotlightPersonName={
          dataSource.spotlightedPerson.person?.preferredName?.value ?? undefined
        }
        spotlightVisibleRelationships={spotlightVisibleRelationships}
        focusedEmployeeId={focusedEmployeeId}
        setFocusedEmployeeId={setFocusedEmployeeId}
        setSpotlight={(newSpotlight) => {
          setSpotlight(newSpotlight, 'control-bar-menu');
          if (newSpotlight) {
            setFilters([]);
          } else if (!!focusedEmployeeId) {
            // viewportActions.fitNodes([focusedEmployeeId]);
          }
        }}
        disabled={dataSource.isFetching}
        filters={filters}
        setFilters={(newFilters) => {
          setFocusedEmployeeId(null);
          setFilters(newFilters);
        }}
        setView={(newView) => {
          setFocusedEmployeeId(null);
          setView(newView);
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={dataSource.personSearch.searchResults}
        areSearchResultsLoading={dataSource.personSearch.isLoading}
        onSearchResultSelect={(employeeId: string) => {
          setSearchTerm('');

          if (dataSource.displayableHierarchy.getNode(employeeId)) {
            setFocusedEmployeeId(employeeId);
            viewportActions.findAndFocusOnNodeBranch(employeeId);
          } else if (dataSource.isFiltering) {
            console.log('[] filtering is on');
            openDialog('org-chart.remove-filters', { employeeId });
          } else {
            toaster.notify({
              variant: 'error',
              title: t('focus.title'),
              description: t('focus.description'),
              showCloseButton: true,
            });
          }
        }}
        hierarchy={dataSource.completeHierarchyData.hierarchy}
        additionalSupervisorAttributes={
          additionalAttribs.additionalSupervisorAttributes
        }
      />
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
            {dataSource.completeHierarchyData.hiddenRootIds?.length ? (
              <EmptyStateWithHangingNodes />
            ) : (
              <EmptyStateWithoutNodes setFilters={setFilters} />
            )}
          </div>
        </Viewport>
      ) : (
        <OrgChartTree
          {...dataSource.displayableHierarchy}
          spotlight={spotlight}
          attributeIds={attributes}
          highlightedAttributeId={highlighted}
          focusedEmployeeId={focusedEmployeeId}
          setFocusedEmployeeId={setFocusedEmployeeId}
          groups={dataSource.groups}
          mode={cardPreferences.cardClustering ? 'compact' : 'horizontal'}
          hidePersonalInfo={!cardPreferences.personalInfo}
          hideAvatars={!cardPreferences.avatars}
          hiddenPeopleCount={
            dataSource.completeHierarchyData.hiddenRootIds.length
          }
          includedRootIds={dataSource.completeHierarchyData.includedRootIds}
          includeOpenPositions={cardPreferences.openPositions}
          additionalSupervisorAttributes={
            additionalAttribs.additionalSupervisorAttributes
          }
          isFiltering={filters?.length > 0}
        />
      )}
      <RemoveFiltersDialog
        onContinue={(employeeId: string) => {
          setFilters([]);
          setSpotlight('');
          setFocusedEmployeeId(employeeId);
        }}
      />
    </>
  );
};

export const OrgChart = () => {
  const prefs = useOrgChartPreferences();

  const additionalSupervisorAttributesData =
    useGetAdditionalSupervisorAttributes();

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
    <TreeLayoutProvider>
      <PersonCardDataLoaderProvider attributeIds={visibleAttributeIds}>
        <PositionCardDataLoaderProvider attributeIds={visibleAttributeIds}>
          <OrgChartPreferencesProvider {...prefs}>
            <OrgChartDataSourceContextProvider preferences={prefs}>
              <OrgChartComponent
                loading={additionalSupervisorAttributesData.isLoading}
                additionalSupervisorAttributes={
                  additionalSupervisorAttributesData.additionalSupervisorAttributes
                }
                {...prefs}
              />
            </OrgChartDataSourceContextProvider>
          </OrgChartPreferencesProvider>
        </PositionCardDataLoaderProvider>
      </PersonCardDataLoaderProvider>
    </TreeLayoutProvider>
  );
};
