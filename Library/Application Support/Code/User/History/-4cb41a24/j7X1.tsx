import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { parseMetadata, suffixMetadata } from '@highlight-ui/utils-commons';
import classnames from 'classnames';

import { useAmplitude } from '@personio-web/amplitude-provider';
import { useAuthContext } from '@personio-web/auth-context';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { icons } from 'designSystem/component/icon';
import { Inline } from 'designSystem/component/layout';
import { toaster } from 'designSystem/component/toaster';

import type { HierarchyTreeNode } from '../types';

import { FeatureFlags, zoomDuration, transitionMaxZoom } from '../constants';
import * as Amp from '../constants/amplitude';
import {
  useOrgChartPreferencesContext,
  useOrgChartDataSourceContext,
  type MultiSettablePrefs,
  useOrgChartUIContext,
} from '../contexts';
import { useTreeLayout } from '../TreeLayout';
import { zoomPadding } from '../OrgChartTree/constants';
import { useGetActiveSourceLayout } from '../sources/layouts/useGetActiveSourceLayout';
import {
  HiddenCardsTrigger,
  ViewActionsBarItem,
  OpenPositionsWithoutSupervisorButton,
} from './components';
import { getControlShortcut, Shortcuts } from './constants';
import { useViewActionsBarShortcuts } from './hooks/useViewActionsBarShortcuts';
import { type ViewActionsBarComponent } from './types';

import { ZoomControls } from './components/ZoomControls/ZoomControls';
import { Separator } from './components/Separator';
import styles from './ViewActionsBar.module.scss';

export const ViewActionsBar: ViewActionsBarComponent = ({ metadata }) => {
  const { track } = useAmplitude();
  const authContext = useAuthContext();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();
  const layout = useGetActiveSourceLayout();
  const ui = useOrgChartUIContext();
  const { fitView } = useTreeLayout<HierarchyTreeNode>();

  const { isOn, isReady } = useFeatureFlag(
    FeatureFlags.ENABLE_REDESIGN_ORG_CHART_CONTROLBAR,
  );
  const isActionBarRedesignEnabled = isOn && isReady;

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.view-actions-bar',
  });
  const { t: tErrors } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  const handleFitToScreen = useCallback(() => {
    track(Amp.FIT_TO_SCREEN, { org_chart_source: prefs.source });
    fitView({
      padding: zoomPadding,
      duration: zoomDuration,
      maxZoom: transitionMaxZoom,
    });
  }, [fitView, track]);

  const { setState: setOrgUnitDetailsState } = useOrgUnitDetailsState();

  const { openDialog } = useDialogContext();
  const handleFocusOnMe = useCallback(() => {
    const nodeId =
      authContext.entityType === 'employee' && String(authContext.employeeId);

    if (!nodeId) {
      toaster.notify({
        variant: 'error',
        title: tErrors('node.title'),
        description: tErrors('node.description'),
        showCloseButton: true,
      });
      return;
    }

    const hiddenList =
      dataSource.completeHierarchyData.data.hiddenRootIds ?? [];
    if (hiddenList.includes(nodeId)) {
      toaster.notify({
        variant: 'error',
        title: tErrors('employee-in-hidden-list.title'),
        description: tErrors('employee-in-hidden-list.description'),
        showCloseButton: true,
      });
      return;
    }

    const node = nodeId && dataSource.displayableHierarchy.getNode(nodeId);

    if (!node) {
      openDialog('org-chart.remove-filters', { employeeId: nodeId });
      return;
    }

    const newPrefs: MultiSettablePrefs = { activeCardId: nodeId };
    const newExpanded = dataSource.getInitialExpandedIds(newPrefs);

    prefs.setMultiplePrefs({
      ...newPrefs,
      expansionState: newExpanded,
      activeAncestorIds: [], // reset so that it'll be derived
    });
    prefs.viewportState.requestNewState({
      mode: 'fitNode',
      nodeId,
      includeChildrenAndParent: true,
      animated: true,
    });

    track(Amp.FOCUSED_ON_ME, { org_chart_source: prefs.source });
  }, [dataSource.getInitialExpandedIds]);

  const handleResetToHomeView = useCallback(() => {
    const newPrefs: MultiSettablePrefs = {
      activeCardId: null,
      filters: [],
      spotlight: '',
      activeAncestorIds: [],
    };
    const newExpanded = dataSource.getInitialExpandedIds(newPrefs);

    prefs.setMultiplePrefs({
      ...newPrefs,
      expansionState: newExpanded,
    });
    prefs.viewportState.requestNewState({
      mode: 'resetViewport',
      animated: true,
    });
    setOrgUnitDetailsState(null);
    ui.reflowToken.generate();

    track(Amp.RESET_TO_HOME, { org_chart_source: prefs.source });
  }, [dataSource.getInitialExpandedIds, setOrgUnitDetailsState]);

  const handleExpandAll = useCallback(() => {
    const expandables = dataSource.displayableHierarchy.nodes
      .filter((node) => node.childrenCount > 0)
      .map((node) => node.id);

    prefs.expansionState.setExpanded(expandables);
    prefs.viewportState.requestNewState({
      mode: 'resetViewport',
      animated: true,
    });
    track(Amp.EXPANDED_ALL, { org_chart_source: prefs.source });
  }, [prefs.source]);

  useViewActionsBarShortcuts({
    onResetToHomeView: handleResetToHomeView,
    onExpandAllCards: handleExpandAll,
    onFocusOnMe: handleFocusOnMe,
    onFitToScreen: handleFitToScreen,
  });

  const controlShortcut = getControlShortcut();

  return (
    <div
      className={classnames(styles.viewActionsBarWrapper, {
        [styles.redesignedActionsBarWrapper]: isActionBarRedesignEnabled,
      })}
    >
      {isActionBarRedesignEnabled && (
        <>
          <RightCurve />
          <LeftCurve />
        </>
      )}
      <HiddenCardsTrigger
        hiddenCardsCount={
          dataSource.completeHierarchyData.data.hiddenRootIds.length
        }
      />
      {prefs.cardPreferences.openPositions && (
        <OpenPositionsWithoutSupervisorButton />
      )}

      {isActionBarRedesignEnabled &&
        (prefs.cardPreferences.openPositions ||
          dataSource.completeHierarchyData.data.hiddenRootIds.length) && (
          <Separator metadata={metadata} />
        )}

      <div
        aria-orientation="horizontal"
        className={styles.viewActionsBar}
        role="menubar"
        {...parseMetadata(metadata)}
      >
        <ZoomControls metadata={metadata} />
        <Inline alignVertical="center" space="gap-small">
          {layout.layout === 'tree' && (
            <ViewActionsBarItem
              hint={t('tooltip.zoom-to-fit')}
              shortcuts={[controlShortcut, Shortcuts.FitToScreen]}
              icon={zoomToFitIcon}
              metadata={suffixMetadata(metadata, 'zoom-to-fit-screen')}
              onClick={handleFitToScreen}
            />
          )}
          {prefs.source === 'Supervisor' && (
            <ViewActionsBarItem
              hint={t('tooltip.focus-on-me')}
              shortcuts={[controlShortcut, Shortcuts.FocusOnMe]}
              icon={icons.person}
              metadata={suffixMetadata(metadata, 'focus-on-me')}
              onClick={handleFocusOnMe}
            />
          )}
          <ViewActionsBarItem
            hint={`${t('tooltip.expand-all-cards')}`}
            shortcuts={[controlShortcut, Shortcuts.ExpandAllCards]}
            icon={expandAllIcon}
            metadata={suffixMetadata(metadata, 'expand-all-cards')}
            onClick={handleExpandAll}
          />
          <ViewActionsBarItem
            hint={t('tooltip.reset-to-home-view')}
            shortcuts={[controlShortcut, Shortcuts.ResetToHomeView]}
            icon={icons.house}
            metadata={suffixMetadata(metadata, 'reset-to-home-view')}
            onClick={handleResetToHomeView}
          />
        </Inline>
      </div>
    </div>
  );
};

const zoomToFitIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<'svg'>
>(({ height, width, fill = 'currentColor' }, ref) => (
  <svg
    height={height}
    width={width}
    fill={fill}
    ref={ref}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.25 2.5H6.70483V4H4.25C3.83579 4 3.5 4.33579 3.5 4.75V7.67553H2V4.75C2 3.50736 3.00736 2.5 4.25 2.5ZM2 12.1011V15.1429C2 16.3855 3.00736 17.3929 4.25 17.3929H6.70483V15.8929H4.25C3.83579 15.8929 3.5 15.5571 3.5 15.1429V12.1011H2ZM16.5014 12.1011V15.1429C16.5014 15.5571 16.1657 15.8929 15.7514 15.8929H13.2964V17.3929H15.7514C16.9941 17.3929 18.0014 16.3855 18.0014 15.1429V12.1011H16.5014ZM18.0014 7.67552V4.75C18.0014 3.50736 16.9941 2.5 15.7514 2.5H13.2964V4H15.7514C16.1657 4 16.5014 4.33579 16.5014 4.75V7.67552H18.0014Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.72141 9.43533C7.13562 9.43533 7.47141 9.77111 7.47141 10.1853L7.47141 11.4319L8.30667 10.5966C8.30857 10.5947 8.31048 10.5927 8.31241 10.5908L11.6179 7.28534L10.3713 7.28534C9.95712 7.28534 9.62134 6.94955 9.62134 6.53534C9.62134 6.12112 9.95712 5.78534 10.3713 5.78534L13.4285 5.78534C13.5302 5.78534 13.6272 5.80557 13.7156 5.84224C13.8027 5.87827 13.8844 5.9314 13.9555 6.00164L13.9589 6.00501L13.9622 6.00839C14.096 6.14383 14.1785 6.32994 14.1785 6.53534L14.1785 6.53548L14.1785 9.59253C14.1785 10.0067 13.8427 10.3425 13.4285 10.3425C13.0143 10.3425 12.6785 10.0067 12.6785 9.59253L12.6785 8.346L11.8433 9.18123C11.8414 9.18318 11.8395 9.18512 11.8375 9.18706L8.53207 12.4925L9.7786 12.4925C10.1928 12.4925 10.5286 12.8283 10.5286 13.2425C10.5286 13.6567 10.1928 13.9925 9.7786 13.9925L6.72141 13.9925C6.61971 13.9925 6.52275 13.9723 6.43432 13.9356C6.34724 13.8996 6.26558 13.8465 6.19446 13.7762L6.19108 13.7729L6.18772 13.7695C6.05397 13.634 5.97141 13.4479 5.97141 13.2425L5.97141 13.2424L5.97141 10.1853C5.97141 9.77111 6.30719 9.43533 6.72141 9.43533Z"
      fill="currentColor"
    />
  </svg>
));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const expandAllIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<'svg'>
>(({ height, width, fill = 'currentColor', ...otherProps }, ref) => (
  <svg
    role="img"
    height={height}
    width={width}
    fill={fill}
    ref={ref}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...otherProps}
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.2197 11.7197C13.5126 11.4268 13.9875 11.4268 14.2804 11.7197C14.5733 12.0126 14.5733 12.4874 14.2804 12.7803L10.5304 16.5303C10.2375 16.8232 9.76262 16.8232 9.46973 16.5303L5.71973 12.7803C5.42684 12.4874 5.42684 12.0126 5.71973 11.7197C6.01262 11.4268 6.4875 11.4268 6.78039 11.7197L10.0001 14.9393L13.2197 11.7197ZM6.78039 8.28033C6.4875 8.57322 6.01262 8.57322 5.71973 8.28033C5.42684 7.98744 5.42684 7.51256 5.71973 7.21967L9.46973 3.46967C9.76263 3.17678 10.2375 3.17678 10.5304 3.46967L14.2804 7.21967C14.5733 7.51256 14.5733 7.98744 14.2804 8.28033C13.9875 8.57322 13.5126 8.57322 13.2197 8.28033L10.0001 5.06066L6.78039 8.28033Z"
      fill="currentColor"
    />
  </svg>
));

const RightCurve = () => (
  <svg
    width="21"
    height="74"
    viewBox="0 0 21 74"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.rightCurve}
  >
    <path d="M21 0.5C21 11.5457 11.5457 27.5 0.5 27.5H0V74H21V0.5Z"></path>
  </svg>
);

const LeftCurve = () => (
  <svg
    width="56"
    height="47"
    viewBox="0 0 56 47"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.leftCurve}
  >
    <path d="M55.0233 0.820465C45.3228 0.820465 36.576 6.33965 32.8571 15.299L23.1429 31.7011C19.424 40.6604 10.6773 47.0001 0.976746 47.0001H56V0.820465H55.0233Z" />
  </svg>
);
