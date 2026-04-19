import React, { useCallback, useRef, useState } from 'react';

import { useOnViewportChange, type Viewport } from 'reactflow';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import { parseMetadata, suffixMetadata } from '@highlight-ui/utils-commons';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useAmplitude } from '@personio-web/amplitude-provider';
import { useAuthContext } from '@personio-web/auth-context';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { icons } from 'designSystem/component/icon';
import { Inline } from 'designSystem/component/layout';
import { toaster } from 'designSystem/component/toaster';
import { OtherPeopleTrigger } from './components/OtherPeopleTrigger/OtherPeopleTrigger';
import { OpenPositionsWithoutSupervisorButton } from './components/OpenPositionsWithoutSupervisor';

import type { HierarchyTreeNode } from '../types';

import {
  FeatureFlags,
  maxZoom,
  minZoom,
  transitionMaxZoom,
  zoomDuration,
  zoomStep,
  zoomToOptions,
} from '../constants';
import * as Amp from '../constants/amplitude';
import {
  useOrgChartPreferencesContext,
  useOrgChartDataSourceContext,
  useViewportActions,
} from '../hooks';
import { zoomPadding } from '../OrgChartTree/constants';
import { useTreeLayout } from '../TreeLayout';
import { CONTROL_MAC, CONTROL_WIN, Shortcuts } from './constants';
import { useViewActionsBarShortcuts } from './hooks/useViewActionsBarShortcuts';
import { type ViewActionsBarComponent } from './types';
import { ViewActionsBarItem } from './components/ViewActionsBarItem/ViewActionsBarItem';

import styles from './VIewActionsBar.module.scss';
type ZoomButtonState = 'IN_DISABLED' | 'OUT_DISABLED' | 'ENABLED';

export const ViewActionsBar: ViewActionsBarComponent = ({
  onZoomIn,
  onZoomOut,
  metadata,
}) => {
  const { track } = useAmplitude();
  const authContext = useAuthContext();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();
  const viewportActions = useViewportActions();

  const { zoomTo, fitView } = useTreeLayout<HierarchyTreeNode>();

  const { isOn, isReady } = useFeatureFlag(
    FeatureFlags.ENABLE_REDESIGN_ORG_CHART_CONTROLBAR,
  );
  const isActionBarRedesignEnabled = isOn && isReady;

  console.log('[] is enabled', isActionBarRedesignEnabled);

  const isWindows =
    typeof window !== 'undefined' &&
    navigator.platform.toLowerCase().includes('win');

  const CONTROL_SHORTCUT = isWindows ? CONTROL_WIN : CONTROL_MAC;

  /**
   * Performance optimisation:
   * using useViewport().zoom will give us the latest zoom value
   * however it comes with the cost of infinite rerenders of this component
   * https://reactflow.dev/api-reference/hooks/use-viewport
   *
   * Instead we skip react for this usecase and directly update the dom
   * for this very particular case it helps gaining 84% of framerate in the whole page
   */
  const zoom = useRef<number>(0);
  const zoomLabel = useRef<HTMLSpanElement>(null);
  const [zoomButtonState, setZoomButtonState] =
    useState<ZoomButtonState>('ENABLED');
  const handleZoomUpdate = useCallback(
    (viewport: Viewport) => {
      if (!zoomLabel.current) return;
      zoom.current = Math.max(minZoom, Math.min(maxZoom, viewport.zoom));
      const displayableZoom = Math.trunc(zoom.current * 100);
      zoomLabel.current.innerText = `${displayableZoom}%`;

      if (viewport.zoom <= minZoom && zoomButtonState === 'ENABLED')
        setZoomButtonState('OUT_DISABLED');
      else if (viewport.zoom >= maxZoom && zoomButtonState === 'ENABLED')
        setZoomButtonState('IN_DISABLED');
      else if (
        viewport.zoom > minZoom &&
        viewport.zoom < maxZoom &&
        zoomButtonState !== 'ENABLED'
      )
        setZoomButtonState('ENABLED');
    },
    [zoomButtonState],
  );
  useOnViewportChange({
    onChange: handleZoomUpdate,
  });

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.view-actions-bar',
  });
  const { t: tErrors } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  const handleZoomOut = useCallback(() => {
    zoomTo(zoom.current - zoomStep, zoomToOptions);
    onZoomOut?.();
  }, [onZoomOut, zoom, zoomTo]);

  const handleZoomIn = useCallback(() => {
    zoomTo(zoom.current + zoomStep, zoomToOptions);
    onZoomIn?.();
  }, [onZoomIn, zoom, zoomTo]);

  const handleFitToScreen = useCallback(() => {
    track(Amp.FIT_TO_SCREEN);
    fitView({
      padding: zoomPadding,
      duration: zoomDuration,
      maxZoom: transitionMaxZoom,
    });
  }, [fitView, track]);

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

    const hiddenList = dataSource.completeHierarchyData.hiddenRootIds ?? [];
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

    prefs.setFocusedEmployeeId(nodeId);
    viewportActions.fitNodeBranch(node);
    track(Amp.FOCUSED_ON_ME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportActions.fitNodeBranch]);

  const handleResetToHomeView = useCallback(() => {
    if (dataSource.isFiltering) {
      if (prefs.filters.length) prefs.setFilters([]);
      if (prefs.spotlight) prefs.setSpotlight('');
    }

    const rootNodeIds =
      dataSource.completeHierarchyData.hierarchy.rootNodes.map(
        (node) => node.id,
      );
    const childrenNodeIds =
      dataSource.completeHierarchyData.hierarchy.rootNodes.flatMap(
        (node) => node.children?.map((child) => child.id) ?? [],
      );

    const shouldUpdateExpand =
      JSON.stringify(dataSource.expansionState.expanded.sort()) !==
      JSON.stringify(rootNodeIds.sort());

    if (shouldUpdateExpand) {
      dataSource.expansionState.setExpanded(rootNodeIds);
    }

    prefs.setFocusedEmployeeId(null);
    dataSource.activeNodesState.setActiveNodeIds([]);
    viewportActions.fitNodes([...rootNodeIds, ...childrenNodeIds], {
      waitForUpdatedPosition: shouldUpdateExpand,
    });
    track(Amp.RESET_TO_HOME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dataSource.expansionState.expanded,
    dataSource.isFiltering,
    viewportActions.fitNodes,
  ]);

  const handleExpandAll = useCallback(() => {
    const expandables = dataSource.displayableHierarchy.nodes
      .filter((node) => node.childrenCount > 0)
      .map((node) => node.id);
    dataSource.expansionState.setExpanded(expandables);
    viewportActions.fitNodes(expandables);
  }, [viewportActions.fitNodes]);

  useViewActionsBarShortcuts({
    onZoomOut: handleZoomOut,
    onZoomIn: handleZoomIn,
    onResetToHomeView: handleResetToHomeView,
    onExpandAllCards: handleExpandAll,
    onFocusOnMe: handleFocusOnMe,
    onFitToScreen: handleFitToScreen,
  });

  return (
    <div
      className={classnames(styles.viewActionsBarWrapper, {
        [styles.redesignedActionsBarWrapper]: isActionBarRedesignEnabled,
      })}
    >
      <RightCurve />
      <OtherPeopleTrigger
        hiddenPeopleCount={
          dataSource.completeHierarchyData.hiddenRootIds.length
        }
      />
      {prefs.cardPreferences.openPositions && (
        <OpenPositionsWithoutSupervisorButton />
      )}

      <div
        aria-orientation="horizontal"
        className={styles.viewActionsBar}
        role="menubar"
        {...parseMetadata(metadata)}
      >
        <Inline alignVertical="center" space="gap-xsmall">
          <ViewActionsBarItem
            hint={t('tooltip.zoom-out')}
            shortcuts={[CONTROL_SHORTCUT, Shortcuts.ZoomOut]}
            icon={icons.minus}
            metadata={suffixMetadata(metadata, 'zoom-out')}
            disabled={zoomButtonState === 'OUT_DISABLED'}
            onClick={handleZoomOut}
          />
          <span
            ref={zoomLabel}
            className={styles.zoomLevel}
            {...parseMetadata(suffixMetadata(metadata, 'current-zoom'))}
          />
          <ViewActionsBarItem
            hint={t('tooltip.zoom-in')}
            shortcuts={[CONTROL_SHORTCUT, Shortcuts.ZoomIn]}
            icon={icons.plus}
            metadata={suffixMetadata(metadata, 'zoom-in')}
            disabled={zoomButtonState === 'IN_DISABLED'}
            onClick={handleZoomIn}
          />
        </Inline>
        <div
          aria-orientation="vertical"
          className={styles.separator}
          role="separator"
          {...parseMetadata(suffixMetadata(metadata, 'separator'))}
        />
        <Inline alignVertical="center" space="gap-small">
          <ViewActionsBarItem
            hint={t('tooltip.zoom-to-fit')}
            shortcuts={[CONTROL_SHORTCUT, Shortcuts.FitToScreen]}
            icon={zoomToFitIcon}
            metadata={suffixMetadata(metadata, 'zoom-to-fit-screen')}
            onClick={handleFitToScreen}
          />
          <ViewActionsBarItem
            hint={t('tooltip.focus-on-me')}
            shortcuts={[CONTROL_SHORTCUT, Shortcuts.FocusOnMe]}
            icon={icons.person}
            metadata={suffixMetadata(metadata, 'focus-on-me')}
            onClick={handleFocusOnMe}
          />
          <ViewActionsBarItem
            hint={`${t('tooltip.expand-all-cards')}`}
            shortcuts={[CONTROL_SHORTCUT, Shortcuts.ExpandAllCards]}
            icon={expandAllIcon}
            metadata={suffixMetadata(metadata, 'expand-all-cards')}
            onClick={handleExpandAll}
          />
          <ViewActionsBarItem
            hint={t('tooltip.reset-to-home-view')}
            shortcuts={[CONTROL_SHORTCUT, Shortcuts.ResetToHomeView]}
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
    fill="currentColor"
    className={styles.rightCurve}
  >
    <path d="M21 0.5C21 11.5457 11.5457 27.5 0.5 27.5H0V74H21V0.5Z"></path>
  </svg>
);
