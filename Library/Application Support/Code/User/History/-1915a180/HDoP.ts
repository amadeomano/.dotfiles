/**
 * This hook provides methods to facilitate zooming and panning the viewport to a specific target coordinates
 * The following methods are available when using this hook:
 *
 * - fitNodes: gets a list of node ids and pan/zoom the viewport to frame them
 * - fitNodeBranch: gets a hierarchy node, expands all the parents if necessary
 * and calls `fitNodes` to frame the node and immediate parents & children
 * - findAndFocusOnNodeBranch: tries to find a node on the chart and proceed with `frameNode`.
 * if fails finding it'll show a toaster error.
 * it has a sideEffect by setting focusedEmployeeId on the preferences context
 *
 * All the above information are readable from `useOrgChartNodesContext`
 */
import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { type Viewport, type Rect, type Transform } from 'reactflow';

import { toaster } from 'designSystem/component/toaster';

import { useOrgChartDataSourceContext } from '.';
import { minZoom, transitionMaxZoom, zoomDuration } from '../constants';
import { zoomPadding } from '../OrgChartTree/constants';
import { type FitNodesOptions, type FocusOptions } from '../OrgChartTree/types';
import {
  useTreeLayoutApi,
  useTreeLayout,
  getRectOfNodes,
  getTransformForBounds,
  type Node,
} from '../TreeLayout';
import { type HierarchyTreeNode, type HierarchyNode } from '../types';
import { waitFor } from '../utils';

type UseViewportActionsResult = {
  fitNodes: (
    nodeIds: string[],
    options?: FitNodesOptions,
  ) => Promise<Viewport | null>;
  fitNodeBranch: (
    node: HierarchyNode,
    options?: FocusOptions,
  ) => Promise<Viewport | null>;
  findAndFocusOnNodeBranch: (
    nodeId: string,
    options?: FocusOptions,
  ) => Promise<Viewport | null>;
};

const getViewportBoundsFromTransform = (
  transform: Transform,
  width: number,
  height: number,
  padding = 0.3,
): Rect => {
  const [x, y, zoom] = transform;

  const paddedWidth = width / zoom / (1 + padding);
  const paddedHeight = height / zoom / (1 + padding);

  const boundsCenterX = (width / 2 - x) / zoom;
  const boundsCenterY = (height / 2 - y) / zoom;

  const boundsWidth = paddedWidth;
  const boundsHeight = paddedHeight;

  const boundsX = boundsCenterX - boundsWidth / 2;
  const boundsY = boundsCenterY - boundsHeight / 2;

  return {
    x: boundsX,
    y: boundsY,
    width: boundsWidth,
    height: boundsHeight,
  };
};

function offsetViewportRectToInclude(viewport: Rect, rect: Rect) {
  const isWithinViewportRect =
    rect.x >= viewport.x &&
    rect.y >= viewport.y &&
    rect.x + rect.width <= viewport.x + viewport.width &&
    rect.y + rect.height <= viewport.y + viewport.height;

  if (isWithinViewportRect) {
    return { ...viewport };
  } else {
    let newX = viewport.x;
    let newY = viewport.y;

    if (rect.x < viewport.x) {
      newX = rect.x;
    } else if (rect.x + rect.width > viewport.x + viewport.width) {
      newX = rect.x + rect.width - viewport.width;
    }

    if (rect.y < viewport.y) {
      newY = rect.y;
    } else if (rect.y + rect.height > viewport.y + viewport.height) {
      newY = rect.y + rect.height - viewport.height;
    }

    return { x: newX, y: newY, width: viewport.width, height: viewport.height };
  }
}

export const useViewportActions = (): UseViewportActionsResult => {
  const dataSource = useOrgChartDataSourceContext();

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  const { getState } = useTreeLayoutApi();
  const { getNode, getViewport, setViewport } =
    useTreeLayout<HierarchyTreeNode>();

  const fitNodes = useCallback(
    async (
      nodeIds: string[],
      options?: FitNodesOptions,
    ): Promise<Viewport | null> => {
      const { waitForUpdatedPosition, allowZoomIn, animate } = {
        waitForUpdatedPosition: true,
        allowZoomIn: true,
        animate: true,
        ...options,
      };

      const previousPositions = JSON.stringify(
        nodeIds.map(getNode).map((node) => node?.positionAbsolute),
      );

      // Wait for node positions to be computed
      const nodes = await waitFor(() => {
        const items = nodeIds.map(getNode);
        const updatedPositions = JSON.stringify(
          items.map((node) => node?.positionAbsolute),
        );

        if (
          items.every(Boolean) &&
          (!waitForUpdatedPosition || previousPositions !== updatedPositions)
        ) {
          return (items as Node<HierarchyTreeNode>[]).map((node) => ({
            ...node,
            // Instantly zoom to the final XY position, skipping the position animation.
            positionAbsolute: {
              x: node.x,
              y: node.y,
            },
          }));
        }
      });

      // Zoom into nodes
      if (nodes /*&& treeRef.current*/) {
        const { zoom: currentZoom } = getViewport();
        const { nodeOrigin, width, height, transform } = getState();
        const nodesRect = getRectOfNodes(nodes, nodeOrigin);
        let [x, y, zoom] = getTransformForBounds(
          nodesRect,
          width,
          height,
          minZoom,
          allowZoomIn ? transitionMaxZoom : currentZoom,
          zoomPadding,
        );

        if (options?.optionalCentering && zoom >= currentZoom) {
          const viewportRect = getViewportBoundsFromTransform(
            transform,
            width,
            height,
          );
          const adjustedViewportRect = offsetViewportRectToInclude(
            viewportRect,
            nodesRect,
          );
          [x, y, zoom] = getTransformForBounds(
            adjustedViewportRect,
            width,
            height,
            minZoom,
            allowZoomIn ? transitionMaxZoom : currentZoom,
            zoomPadding,
          );
        }
        setViewport(
          { x, y, zoom },
          animate ? { duration: zoomDuration } : undefined,
        );
        return Promise.resolve({ x, y, zoom });
      } else {
        return Promise.resolve(null);
      }
    },
    [getNode, getViewport, getState, setViewport],
  );

  const fitNodeBranch = useCallback(
    async (
      node: HierarchyNode,
      options?: FocusOptions,
    ): Promise<Viewport | null> => {
      const ancestorNodeIds = node.ancestors.map((ancestor) => ancestor.id);
      const expandedNodesIds = [node.id, ...ancestorNodeIds];
      const focusedNodes = [node.id];

      if (node.children) {
        focusedNodes.push(...node.children.map((child) => child.id));
      }

      if (node.parent && (!node.children || options?.includeDirectAncestors)) {
        focusedNodes.push(node.parent.id);
      }

      const shouldUpdateExpand = !expandedNodesIds.every((id) =>
        dataSource.expansionState.expanded.includes(id),
      );

      if (shouldUpdateExpand) {
        dataSource.expansionState.setExpanded(expandedNodesIds);
      }

      dataSource.activeNodesState.setActiveNodeIds(expandedNodesIds);
      return fitNodes(focusedNodes, {
        waitForUpdatedPosition: shouldUpdateExpand,
        ...options,
      });
    },
    [dataSource.expansionState.expanded, fitNodes],
  );

  const findAndFocusOnNodeBranch = useCallback(
    async (
      nodeId: string,
      options?: FocusOptions,
    ): Promise<Viewport | null> => {
      const node = dataSource.completeHierarchyData.hierarchy.getNode(nodeId);

      if (!node) {
        toaster.notify({
          variant: 'error',
          title: t('focus.title'),
          description: t('focus.description'),
          showCloseButton: true,
        });
        return Promise.resolve(null);
      }

      return fitNodeBranch(node, options);
    },
    [dataSource.displayableHierarchy.getNode, fitNodeBranch, t],
  );

  return {
    fitNodes,
    fitNodeBranch,
    findAndFocusOnNodeBranch,
  };
};
