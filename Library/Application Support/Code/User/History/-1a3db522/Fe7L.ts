import { useCallback } from 'react';
import {
  type Rect,
  type CoordinateExtent,
  useStoreApi,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';

import { minZoom, transitionMaxZoom } from '../../constants';
import { zoomPadding } from '../../OrgChartTree/constants';
import { useOrgChartUIContext } from '../../contexts';

import { type BaseData, type Node } from '../types';
import { type VisibleChartData } from '../../contexts/utils/useCalculateVisibleChartData';

export const useViewportCalculations = () => {
  const ui = useOrgChartUIContext();
  const reactFlowAPI = useStoreApi();

  const getViewportForNodes = useCallback(
    <T extends BaseData>(
      nodes: Node<T>[],
      nodeSize: { width: number; height: number },
      options = { noPadding: false },
    ) => {
      const reactFlowState = reactFlowAPI.getState();
      // getRectOfNodes surrounds only the x and y coordinates
      const nodesRect = getRectOfNodes(nodes, reactFlowState.nodeOrigin);

      // adding nodeSize to create a bounding rect around the nodes
      const nodesBoundingRect: Rect = {
        x: nodesRect.x,
        y: nodesRect.y,
        width: nodesRect.width + nodeSize.width,
        height: nodesRect.height + nodeSize.height,
      };

      const [x, y, zoom] = getTransformForBounds(
        nodesBoundingRect,
        ui.chartArea.current?.clientWidth ?? reactFlowState.width,
        ui.chartArea.current?.clientHeight ?? reactFlowState.height,
        minZoom,
        transitionMaxZoom,
        options.noPadding ? 0 : zoomPadding,
      );

      return { x, y, zoom };
    },
    [reactFlowAPI],
  );

  const isVerticalScrollable = useCallback(
    (extent: VisibleChartData['translateExtent']) => {
      const reactFlowState = reactFlowAPI.getState();
      const chartHeight = extent[1][1] - extent[0][1];
      const clientHeight =
        ui.chartArea.current?.clientHeight ?? reactFlowState.height;
      if (chartHeight <= clientHeight) return false;
      return true;
    },
    [reactFlowAPI],
  );

  const getScrollableViewport = useCallback(
    (extent: VisibleChartData['translateExtent']) => {
      const reactFlowState = reactFlowAPI.getState();
      const extentWidth = extent[1][0] - extent[0][0];
      const clientWidth =
        ui.chartArea.current?.clientWidth ?? reactFlowState.width;

      const x = (clientWidth - extentWidth) / 2;
      return { x, y: 0, zoom: 1 };
    },
    [reactFlowAPI],
  );

  const getViewportIncludingNode = useCallback(
    <T extends BaseData>(
      node: Node<T>,
      nodeSize: { width: number; height: number },
      translateExtent: CoordinateExtent,
    ) => {
      const reactFlowState = reactFlowAPI.getState();
      const currentViewport = reactFlowState.transform;

      // Get node bounding box in world coordinates
      const nodeRect: Rect = {
        x: node.position.x,
        y: node.position.y,
        width: nodeSize.width,
        height: nodeSize.height,
      };

      // Get current visible area in world coordinates
      const width = ui.chartArea.current?.clientWidth ?? reactFlowState.width;
      const height =
        ui.chartArea.current?.clientHeight ?? reactFlowState.height;
      const currentZoom = currentViewport[2];

      const visibleRect = {
        x: -currentViewport[0] / currentZoom,
        y: -currentViewport[1] / currentZoom,
        width: width / currentZoom,
        height: height / currentZoom,
      };

      // Check if node is already visible
      const isNodeVisible =
        nodeRect.x >= visibleRect.x &&
        nodeRect.y >= visibleRect.y &&
        nodeRect.x + nodeRect.width <= visibleRect.x + visibleRect.width &&
        nodeRect.y + nodeRect.height <= visibleRect.y + visibleRect.height;

      if (isNodeVisible) {
        // Node is already visible, keep current viewport
        return {
          x: currentViewport[0],
          y: currentViewport[1],
          zoom: currentViewport[2],
        };
      }

      // Calculate minimal adjustment needed
      let newX = visibleRect.x;
      let newY = visibleRect.y;

      // Adjust horizontally if needed
      if (nodeRect.x < visibleRect.x) {
        newX = nodeRect.x - zoomPadding / currentZoom;
      } else if (
        nodeRect.x + nodeRect.width >
        visibleRect.x + visibleRect.width
      ) {
        newX =
          nodeRect.x +
          nodeRect.width -
          visibleRect.width +
          zoomPadding / currentZoom;
      }

      // Adjust vertically if needed
      if (nodeRect.y < visibleRect.y) {
        newY = nodeRect.y - zoomPadding / currentZoom;
      } else if (
        nodeRect.y + nodeRect.height >
        visibleRect.y + visibleRect.height
      ) {
        newY =
          nodeRect.y +
          nodeRect.height -
          visibleRect.height +
          zoomPadding / currentZoom;
      }

      // Apply translateExtent constraints
      const maxX = translateExtent[1][0] - width / currentZoom;
      const maxY = translateExtent[1][1] - height / currentZoom;

      newX = Math.max(translateExtent[0][0], Math.min(newX, maxX));
      newY = Math.max(translateExtent[0][1], Math.min(newY, maxY));

      return {
        x: -newX * currentZoom,
        y: -newY * currentZoom,
        zoom: currentZoom,
      };
    },
    [reactFlowAPI, ui.chartArea],
  );

  return {
    isVerticalScrollable,
    getViewportForNodes,
    getScrollableViewport,
    getViewportIncludingNode,
  };
};
