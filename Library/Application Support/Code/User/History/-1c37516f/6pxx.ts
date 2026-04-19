import { useReactFlow, type Viewport } from 'reactflow';
import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../contexts';
import { zoomDuration } from '../../constants';
import { type BaseData, type Node } from '../types';
import { ROOT_NODE_ID } from '../../sources/layouts/tree';
import { useGetActiveSourceLayout } from '../../sources/layouts/useGetActiveSourceLayout';
import { useViewportCalculations } from './useViewportCalculations';

export const useResolveViewportRequest = (): Viewport | undefined => {
  const reactFlow = useReactFlow();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();
  const viewportCalculations = useViewportCalculations();
  const activeSourceLayout = useGetActiveSourceLayout();

  if (!reactFlow.viewportInitialized) return;
  if (prefs.viewportState.requestedState === null) return;

  const requestedState = prefs.viewportState.requestedState;
  console.log('[] resolving', requestedState);

  if (requestedState.mode === 'fitNode') {
    const extraNodes: Node<BaseData>[] = [];
    const node = dataSource.visibleChartData.nodes.find(
      (node) => node.id === requestedState.nodeId,
    );
    console.log('[] node', node);
    if (!node) return;
    if (requestedState.includeChildrenAndParent) {
      if (node.parent && node.parent.id !== ROOT_NODE_ID)
        extraNodes.push(node.parent);
      if (node.children) extraNodes.push(...node.children);
    }

    const viewport = requestedState.noCentering
      ? viewportCalculations.getViewportIncludingNode(
          node,
          dataSource.visibleChartData.nodeSize,
          dataSource.visibleChartData.translateExtent,
        )
      : viewportCalculations.getViewportForNodes(
          [node, ...extraNodes],
          dataSource.visibleChartData.nodeSize,
        );

    reactFlow.setViewport(viewport, {
      duration: requestedState.animated ? zoomDuration : 0,
    });
    prefs.viewportState.requestNewState(null);
    return viewport;
  }

  if (requestedState.mode === 'resetViewport') {
    const viewport = activeSourceLayout.getResetViewport(
      prefs,
      dataSource.visibleChartData,
    );

    reactFlow.setViewport(viewport, {
      duration: requestedState.animated ? zoomDuration : 0,
    });
    prefs.viewportState.requestNewState(null);
    return viewport;
  }
};
