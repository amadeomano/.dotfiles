import { DEFAULT_NODE_GROUP_ID, defaultTreeLayoutOptions } from '../constants';
import {
  type BaseData,
  type GroupedNode,
  type TreeEdges,
  type TreeLayoutOptions,
  type TreeNode,
} from '../types';
import { isClusterNodeInSecondRow } from './isClusterNodeInSecondRow';

/**
 Maps tree nodes to edges and sorts them to ensure active edges are rendered above default ones.
 */
export function mapEdges<T extends BaseData>({
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
function mapEdgesRecursively<T extends BaseData>(
  treeNodes: TreeNode<T>[],
  layoutOptions?: TreeLayoutOptions,
): TreeEdges[] {
  const {
    nodeSize: { width },
    spacing: { sibling: siblingSpacing },
    getEdgeStyle,
  } = { ...defaultTreeLayoutOptions, ...layoutOptions };

  const edges: TreeEdges[] = [];

  console.log('%c[] iterate over', 'color:green', treeNodes);
  treeNodes.forEach((node) => {
    if (
      node.depth < 1 ||
      !node.children ||
      (layoutOptions?.groups?.length &&
        node.group?.id !== DEFAULT_NODE_GROUP_ID)
    ) {
      return;
    }
    console.groupCollapsed('[] for node', node.id);

    const firstRowChildren = node.children.filter(
      (child) =>
        (!child.cluster || !isClusterNodeInSecondRow(child)) &&
        (!layoutOptions?.groups?.length ||
          child.group?.id === DEFAULT_NODE_GROUP_ID),
    );
    const coveredActiveChilds: NonNullable<(typeof node)['children']> = [];

    firstRowChildren.forEach((currentChild, i) => {
      const previousNode = firstRowChildren[i - 1];
      const nextNode = firstRowChildren[i + 1];
      const isFirstChild = i === 0;
      const isLastChild = i === firstRowChildren.length - 1;
      const isDirectlyBelowParent = node.x === currentChild.x;
      const isNodeActive: boolean = node.data.isActive as boolean;
      const isCurrentChildActive: boolean =
        isNodeActive && (currentChild.data.isActive as boolean);

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
        !isDirectlyBelowParent || // side edges
        (isDirectlyBelowParent && isFirstChild && isLastChild) || // only child
        (isDirectlyBelowParent && isCurrentChildActive) || // active & center
        (isDirectlyBelowParent && isAboveAnActiveNode(currentChild)) // only child
      ) {
        console.log('[] √ not directly under parent', currentChild.id);
        const activeChildUnder = getActiveChildUnderEdge(node, currentChild);
        if (activeChildUnder) coveredActiveChilds.push(activeChildUnder);

        edges.push(
          createEdge({
            source: node.id,
            target: currentChild.id,
            isActive:
              isCurrentChildActive ||
              isAboveAnActiveNode(currentChild) ||
              (!!activeChildUnder && coveredActiveChilds.length === 1),
            getEdgeStyle,
          }),
        );
      }
    });
    edges.push(...mapEdgesRecursively(node.children, layoutOptions));
    console.groupEnd();
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

function getActiveChild<T extends BaseData>(node: TreeNode<T>) {
  const activeChild = node.children?.find(
    (child) => !child.children && child.data.isActive,
  );

  return activeChild;
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

function isAboveAnActiveNode<T extends BaseData>(node: TreeNode<T>): boolean {
  const activeChild = node.cluster?.nodes?.find(
    (child) => !child.children && child.data.isActive,
  );

  if (!activeChild) return false;
  if (activeChild.x !== node.x) return false;

  return true;
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
