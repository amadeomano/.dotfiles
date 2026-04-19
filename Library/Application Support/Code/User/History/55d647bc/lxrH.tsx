import { useCallback } from 'react';
import { ReactFlow, useStoreApi } from 'reactflow';
import { zoomIdentity } from 'd3-zoom';

import { IS_TEST_BUILD } from '@personio-web/global-constants';

import { useGetActiveSourceLayout } from '../sources/layouts/useGetActiveSourceLayout';

import type { CardProps } from '../types';
import { Viewport } from '../Viewport';
import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
  useOrgChartUIContext,
} from '../contexts';
import type { BaseData, TreeLayoutProps } from './types';

import { nonInteractiveProps } from './constants';
import { useAnimatedNodes } from './hooks';

import './TreeLayout.module.scss';
import { useResolveViewportRequest } from './hooks/useResolveViewportRequest';

export function TreeLayout<T extends BaseData & CardProps>({
  nodeTypes,
  interactive = !IS_TEST_BUILD,
}: TreeLayoutProps) {
  const ui = useOrgChartUIContext();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();
  const layout = useGetActiveSourceLayout<T>();

  const viewport = useResolveViewportRequest();

  const animateGroupNodes = useAnimatedNodes(
    dataSource.visibleChartData.groupNodes,
    {
      duration: IS_TEST_BUILD ? 0 : 200,
    },
  );

  const animatedNodes = useAnimatedNodes(dataSource.visibleChartData.nodes, {
    duration: IS_TEST_BUILD ? 0 : 200,
  });

  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac');

  // This callback is a workaround due to the whole ReactFlow instance being unmounted during loading and error states
  // to be removed once ReactFlow is mounted only once (in the OrgChart component)
  const reactFlowAPI = useStoreApi();
  const handleInit = useCallback(() => {
    if (!viewport) return;
    const finalTransform = zoomIdentity
      .translate(viewport.x, viewport.y)
      .scale(viewport.zoom);
    const d3Selection = reactFlowAPI.getState().d3Selection;
    if (d3Selection)
      reactFlowAPI.getState().d3Zoom?.transform(d3Selection, finalTransform);
  }, [viewport]);

  return (
    <Viewport>
      <ReactFlow
        {...layout.getReactFlowProps(prefs)}
        {...(interactive ? {} : nonInteractiveProps)}
        panOnScroll={isMac}
        nodes={[...animateGroupNodes, ...animatedNodes]}
        edges={dataSource.visibleChartData.edges}
        translateExtent={dataSource.visibleChartData.translateExtent}
        nodeTypes={nodeTypes}
        onlyRenderVisibleElements={!ui.isExporting.value}
        // onInit won't be necessary if TreeLayout doesn't get unmounted during loading and error states
        onInit={handleInit}
        role="tree"
      />
    </Viewport>
  );
}
