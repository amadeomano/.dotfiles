import type { UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { useCallback, useRef, useState, useMemo } from 'react';

import { useStoreApi } from 'reactflow';
import {
  getRectOfNodes,
  getTransformForBounds,
  type Node,
  useTreeLayout,
  useTreeLayoutApi,
} from '../TreeLayout';
import { useExpansionState } from './useExpansionState';
import {
  type HierarchyTreeNode,
  type HierarchyNode,
  type EntityNode,
} from '../types';
import { waitFor } from '../utils';
import {
  minZoom,
  transitionMaxZoom,
  zoomDuration,
  zoomPadding,
} from '../constants';

export type FocusOptions = {
  includeDirectAncestors?: boolean;
  animate?: boolean;
};

export type FitNodesOptions = FocusOptions & {
  waitForUpdatedPosition?: boolean;
  allowZoomIn?: boolean;
};

type RootNodes = UseHierarchicalDataReturnType<EntityNode>['rootNodes'];

export const useOrgChartViewController = (
  expanded: string[],
  setExpanded: (nextExpanded: string[]) => void,
  setActiveNodeIds: (nextActiveNodeIds: string[]) => void,
) => {
  // const treeRef = useRef<HTMLDivElement>(null);

  const {
    getNode: getTreeNode,
    getViewport,
    setViewport,
  } = useTreeLayout<HierarchyTreeNode>();
  const { getState } = useTreeLayoutApi();
  const store = useStoreApi();
  // console.log(
  //   '[] store nodes %o, transform: %o, panZoom: %o ',
  //   store.getState().getNodes().length,
  //   store.getState().transform,
  // );

  const fitNodes = useCallback(
    async (nodeIds: string[], options?: FitNodesOptions) => {
      const { waitForUpdatedPosition, allowZoomIn, animate } = {
        waitForUpdatedPosition: true,
        allowZoomIn: true,
        animate: true,
        ...options,
      };

      const previousPositions = JSON.stringify(
        nodeIds.map(getTreeNode).map((node) => node?.positionAbsolute),
      );

      // Wait for node positions to be computed
      const nodes = await waitFor(() => {
        const items = nodeIds.map(getTreeNode);
        const updatedPositions = JSON.stringify(
          items.map((node) => node?.positionAbsolute),
        );

        console.log('[] hooks items', items);
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
        } else {
          console.log('[] hooks condition not met');
        }
      });

      // Zoom into nodes
      if (nodes) {
        const { zoom: currentZoom } = getViewport();
        const { nodeOrigin, width, height } = getState();
        const nodesRect = getRectOfNodes(nodes, nodeOrigin);
        const [x, y, zoom] = getTransformForBounds(
          nodesRect,
          width,
          height,
          minZoom,
          allowZoomIn ? transitionMaxZoom : currentZoom,
          zoomPadding,
        );

        console.log('[] setting viewport to ', {
          x,
          y,
          zoom,
          animate,
        });
        setViewport(
          {
            x,
            y,
            zoom,
          },
          animate ? { duration: zoomDuration } : undefined,
        );
        console.log('[] 1 viewport is ', getViewport());
        // focusedNodes.current = nodeIds;
      }
    },
    [getTreeNode, getViewport, getState, setViewport],
  );

  const focusOnNode = useCallback(
    (node: HierarchyNode, options?: FocusOptions) => {
      console.log('[] focusing on ', node);
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
        expanded.includes(id),
      );

      if (shouldUpdateExpand) {
        setExpanded(expandedNodesIds);
      }

      setActiveNodeIds(expandedNodesIds);
      fitNodes(focusedNodes, {
        waitForUpdatedPosition: shouldUpdateExpand,
        ...options,
      });
    },
    [expanded, fitNodes, setExpanded],
  );

  return {
    // treeRef,
    fitNodes,
    focusOnNode,
  };
};
