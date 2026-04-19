import { DEFAULT_NODE_GROUP_ID, defaultTreeLayoutOptions } from '../constants';
import {
  type BaseData,
  type GroupedNode,
  type TreeEdges,
  type TreeLayoutOptions,
  type TreeNode,
} from '../types';
import { type CardProps } from '../../types';
import { isClusterNodeInSecondRow } from './isClusterNodeInSecondRow';

/**
 Maps tree nodes to edges and sorts them to ensure active edges are rendered above default ones.
 */
export function mapEdges<T extends BaseData & CardProps>({
  treeNodes,
  groupNodes,
  layoutOptions,
}: {
  treeNodes: TreeNode<T>[];
  groupNodes?: GroupedNode<T>[];
  layoutOptions?: TreeLayoutOptions;
}): TreeEdges[] {
  const edges = mapEdgesRecursively<T>(treeNodes, layoutOptions);

  if (groupNodes) {
    edges.push(...mapGroupEdges(groupNodes, layoutOptions?.getEdgeStyle));
  }

  // Ensure active edges are rendered above default ones.
  edges.sort((edgeA, edgeB) => {
    if (edgeA.data.isActive === edgeB.data.isActive) {
      return 0;
    }
    return edgeA.data.isActive ? 1 : -1;
  });
  return edges;
}
/**
 Recursively maps tree nodes to edges.
 */
function mapEdgesRecursively<T extends BaseData & CardProps>(
  treeNodes: TreeNode<T>[],
  layoutOptions?: TreeLayoutOptions,
): TreeEdges[] {
  const {
    nodeSize: { width },
    spacing: { sibling: siblingSpacing },
    getEdgeStyle,
  } = { ...defaultTreeLayoutOptions, ...layoutOptions };

  const edges: TreeEdges[] = [];

  treeNodes.forEach((node) => {
    if (
      node.depth < 1 ||
      !node.children ||
      (layoutOptions?.groups?.length &&
        node.group?.id !== DEFAULT_NODE_GROUP_ID)
    ) {
      return;
    }

    const firstRowChildren = node.children.filter(
      (child) =>
        (!child.cluster || !isClusterNodeInSecondRow(child)) &&
        (!layoutOptions?.groups?.length ||
          child.group?.id === DEFAULT_NODE_GROUP_ID),
    );
    // keeps track of edges above the active child
    const coveredActiveChilds: NonNullable<(typeof node)['children']> = [];

    firstRowChildren.forEach((currentChild, i) => {
      const previousNode = firstRowChildren[i - 1];
      const nextNode = firstRowChildren[i + 1];
      const isFirstChild = i === 0;
      const isLastChild = i === firstRowChildren.length - 1;
      const isDirectlyBelowParent = node.x === currentChild.x;
      const isNodeActive: boolean = node.data.isActive;
      const isCurrentChildActive: boolean =
        isNodeActive && currentChild.data.isActive;

      // Check for extra spacing between siblings, indicating a break in continuity.
      const hasExtraSpacingBetweenSiblings =
        (previousNode &&
          previousNode.x + width + siblingSpacing < currentChild.x) ||
        (nextNode && currentChild.x + width + siblingSpacing < nextNode.x);

      const shouldCreateEdge =
        isFirstChild ||
        isLastChild ||
        isDirectlyBelowParent ||
        hasExtraSpacingBetweenSiblings;

      if (!shouldCreateEdge) return;

      if (
        !isDirectlyBelowParent || // is on one of the side edges
        (isDirectlyBelowParent && isFirstChild && isLastChild) || // is the single child
        (isDirectlyBelowParent && isCurrentChildActive) || // is active and located right below parent
        (isDirectlyBelowParent && isNodeAboveAnActiveNode(currentChild)) // is below parent & the one below it is active
      ) {
        const activeChildUnder = getActiveChildUnderEdge(node, currentChild);
        if (activeChildUnder) coveredActiveChilds.push(activeChildUnder);

        edges.push(
          createEdge({
            source: node.id,
            target: currentChild.id,
            isActive:
              isCurrentChildActive ||
              isNodeAboveAnActiveNode(currentChild) ||
              // ensures only one edge covers the active child
              (!!activeChildUnder && coveredActiveChilds.length === 1),
            getEdgeStyle,
          }),
        );
      }
    });
    edges.push(...mapEdgesRecursively(node.children, layoutOptions));
  });
  return edges;
}

/**
 Maps group edges to connect group nodes to their related node.
 */
function mapGroupEdges<T extends BaseData>(
  groupNodes: GroupedNode<T>[],
  getEdgeStyle?: TreeLayoutOptions['getEdgeStyle'],
): TreeEdges[] {
  const edges: TreeEdges[] = [];

  groupNodes.forEach(({ id, data }) => {
    const { id: groupId, relatedNodeId, relationshipType } = data;

    if (!relatedNodeId || !relationshipType) {
      return;
    }

    edges.push(
      createEdge({
        source: relationshipType === 'parent' ? id : relatedNodeId,
        target: relationshipType === 'parent' ? relatedNodeId : id,
        groupId,
        getEdgeStyle,
      }),
    );
  });

  return edges;
}

function getActiveChildUnderEdge<T extends BaseData>(
  source: TreeNode<T>,
  target: TreeNode<T>,
) {
  const edgeStartX = source.x;
  const edgeEndX = target.x;
  const edgeLocation = edgeStartX > edgeEndX ? 'left' : 'right';

  const activeChild = source.children?.find(
    (child) => !child.children && child.data.isActive,
  );

  if (!activeChild) return undefined;

  if (
    edgeLocation === 'right' &&
    activeChild.x > edgeStartX &&
    activeChild.x <= edgeEndX
  )
    return activeChild;
  if (
    edgeLocation === 'left' &&
    activeChild.x < edgeStartX &&
    activeChild.x >= edgeEndX
  )
    return activeChild;

  return undefined;
}

function isNodeAboveAnActiveNode<T extends BaseData>(
  node: TreeNode<T>,
): boolean {
  return node.cluster?.nodes?.some(
    (child) => !child.children && child.data.isActive && child.x === node.x,
  );
}

/**
 Creates an edge between a parent node and a child node.
 */
function createEdge({
  source,
  target,
  isActive = false,
  groupId,
  getEdgeStyle,
}: {
  source: string;
  target: string;
  isActive?: boolean;
  groupId?: string;
  getEdgeStyle?: TreeLayoutOptions['getEdgeStyle'];
}): TreeEdges {
  const id = `${source}-${target}`;

  const edge: TreeEdges = {
    id,
    source,
    target,
    type: 'default',
    data: {
      isActive,
      groupId,
    },
  };

  if (getEdgeStyle) {
    edge.style = getEdgeStyle(edge) || {};
  }

  return edge;
}
