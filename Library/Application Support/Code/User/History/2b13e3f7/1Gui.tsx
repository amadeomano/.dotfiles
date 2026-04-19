import { useRef, useState, useCallback } from 'react';
import { useOnViewportChange, useReactFlow, type Viewport } from 'reactflow';
import { useTranslation } from 'react-i18next';

import { Inline } from 'designSystem/component/layout';
import { icons } from 'designSystem/component/icon';

import {
  parseMetadata,
  suffixMetadata,
  type ComponentMetadata,
} from '@personio-web/design-system-utils';

import { useOrgChartPreferencesContext } from '../../../contexts/useOrgChartPreferences';
import { minZoom, maxZoom, zoomStep, zoomToOptions } from '../../../constants';
import { getControlShortcut, Shortcuts } from '../../constants';
import { ViewActionsBarItem } from '../ViewActionsBarItem/ViewActionsBarItem';
import { Separator } from '../Separator';
import { useZoomShortcuts } from './useZoomShortcuts';

import styles from './ZoomControls.module.scss';

type ZoomButtonState = 'IN_DISABLED' | 'OUT_DISABLED' | 'ENABLED';

type Props = { metadata?: ComponentMetadata };
export const ZoomControls = ({ metadata }: Props) => {
  const prefs = useOrgChartPreferencesContext();
  const { zoomTo } = useReactFlow();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.view-actions-bar',
  });

  const isZoomable =
    prefs.source === 'Supervisor' ||
    (
      prefs.expansionState.derivedExpandedIds.current ??
      prefs.expansionState.expanded
    )?.length > 0;

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

  const handleZoomOut = useCallback(() => {
    if (!isZoomable) return;
    zoomTo(zoom.current - zoomStep, zoomToOptions);
  }, [zoom, zoomTo, isZoomable]);

  const handleZoomIn = useCallback(() => {
    if (!isZoomable) return;
    zoomTo(zoom.current + zoomStep, zoomToOptions);
  }, [zoom, zoomTo, isZoomable]);

  useZoomShortcuts({
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  if (!isZoomable) return null;

  const controlShortcut = getControlShortcut();

  return (
    <Inline alignVertical="center" space="gap-xsmall">
      <ViewActionsBarItem
        hint={t('tooltip.zoom-out')}
        shortcuts={[controlShortcut, Shortcuts.ZoomOut]}
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
        shortcuts={[controlShortcut, Shortcuts.ZoomIn]}
        icon={icons.plus}
        metadata={suffixMetadata(metadata, 'zoom-in')}
        disabled={zoomButtonState === 'IN_DISABLED'}
        onClick={handleZoomIn}
      />
      <Separator metadata={metadata} />
    </Inline>
  );
};
