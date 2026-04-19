import { inspect } from 'util';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  BaseData,
  ClusterTreeNode,
  TreeLayoutOptions,
  TreeNode,
} from '../types';

import { DEFAULT_NODE_GROUP_ID, defaultTreeLayoutOptions } from '../constants';
import { isClusterNodeInSecondRow } from './isClusterNodeInSecondRow';

const ROOT_NODE_ID = 'ROOT_NODE';
const MIN_GROUP_COUNT = 1; // Minimum number of groups to consider for group layout, condescending the default group

/**
 * Computes the x and y coordinates of hierarchical nodes on a tree diagram in two layout modes:
 * - **Horizontal**: all nodes at the same depth are vertically aligned.
 * - **Compact**: four or more consecutive leaf nodes are arranged in a two-row cluster.
 *
 * Terminology:
 * ---
 * - **Ancestor**: Any node above the current node in the hierarchy, including the immediate parent and nodes further up.
 * - **Descendant**: Any node below the current node in the hierarchy, including immediate children and nodes further down.
 * - **Siblings**: Nodes that share the same parent node.
 * - **Depth**: The rank or position of a node within the hierarchy.
 * - **Leaf**: Any node without descendants.
 *
 * Logic:
 * ---
 * The **x coordinate** is determined by plotting node from left to right in a
 * post-order tree traversal, starting with the leftmost node at x = 0 and
 * shifting further nodes rightwards in a sequential manner.
 *
 * The **y coordinate** is computed by starting with the ancestor node's y-coordinate,
 * then adding the current node's height, and including a margin between the node
 * and its descendants to ensure clear visualization and avoid overlap.
 *
 * More details on each step are documented within the function.
 *
 * This function is based on:
 * - [D3 tree function](https://github.com/d3/d3-hierarchy/blob/main/src/tree.js)
 * - [Reingold-Tilford "tidy" algorithm](https://reingold.co/tidier-drawings.pdf)
 */
export function computeTreeCoordinates<T extends BaseData>(
  rootNodes: TreeNode<T>[],
  options: TreeLayoutOptions = {},
): TreeNode<T>[] {
  const { nodeSize, mode, spacing, groups, groupPadding } = {
    ...defaultTreeLayoutOptions,
    ...options,
  };
  const horizontalNodeSpacing = nodeSize.width + spacing.sibling;
  const verticalNodeSpacing = nodeSize.height + spacing.children;
  const verticalClusterNodeSpacing = nodeSize.height + spacing.sibling;
  const horizontalSubTreeSpacing =
    (spacing.subtrees - spacing.sibling) / nodeSize.width;
  const verticalGroupsSpacing = spacing.groups;
  const horizontalGroupsSpacing =
    horizontalSubTreeSpacing +
    (spacing.groups - spacing.sibling) / nodeSize.width;

  /**
   * To enable the tree diagram to have multiple root nodes, a higher-level virtual root node is created.
   * This is necessary to satisfy the algorithm's requirement of a single root node.
   * The virtual root node is used for computation only and is not returned in the final output.
   */
  const root = createRootNode(rootNodes);

  /**
   * Groups:
   * ---
   * Nodes can be visually grouped, keeping the default group in the center.
   */
  const depthWithGroup = new Set<number>();
  const sortedGroups = sortGroups(groups);

  /**
   * Compact layout:
   * ---
   * Node clusters form when there are more than three consecutive sibling leaf nodes in sequence.
   * Each node within a cluster is annotated with metadata, and the cluster depth is stored for layout computation.
   */
  const depthWithCluster = new Set<number>();
  if (mode === 'compact') {
    traverseTreeBefore(root, computeCluster);
  } else if (sortedGroups.length > MIN_GROUP_COUNT) {
    traverseTreeBefore(root, sortNodesByGroup);
  }

  /**
   * Computing x coordinate variables
   * ---
   * To determine the x coordinate of every node, three variables are calculated:
   * - **Prelim:** Initial x-coordinate of the node based on its position within the tree.
   * - **Mod:** refers to the amount of shift for the node’s descendants (but not the node itself), to make the children centered with respect to itself
   * - **Shift:** refers to the amount of shift for the node’s descendants, including itself, to not overlap with the subtrees to the left of itself
   *
   * The tree example will be traversed in alphabetical order:
   * ```
   *      Root node
   *     /  /   \  \
   *    E   F    J  K
   *   / \     / | \
   *  A   B   G  H  I
   *  C   D
   *```
   * A-B-C-D nodes are in a cluster formation.
   *
   * **Prelim**
   *
   * The leftmost node (node A) starts with the `prelim` of 0, the following nodes will sum the left sibling's `prelim`
   * and a sibling distance of 1 (B has prelim = 1).
   * If a node is in the second row of a cluster, its `prelim` matches that of the node above it (e.i. D has prelim 1).
   * If a node is the leftmost child and has children, its `prelim` is the midpoint of its children's prelim values
   * (e.i. E has prelim 0.5). Nodes grouping can also affect the prelim value.
   *
   * **Mod**
   *
   * Nodes with children that are NOT the leftmost node of their subtree, the `mod` is set to their prelim
   * minus the midpoint of their children (e.i. J has mod 1.5). Nodes grouping can also affect the mod value in order
   * to keep the default group centralized.
   *
   * **Shift**
   *
   * `Shift` ensures minimal subtree distance between nodes from different parents to avoid overlaps.
   * To detect overlaps, the rightmost descendant of the left subtree (right contour) and the leftmost
   * descendant of the right subtree (left contour) are compared at every level.
   *
   * In the example, node B (on the right contour) has a current x-coordinate of 1, and node G (on the left contour)
   * has a current x-coordinate of 1.5.
   * To maintain a minimum subtree distance of 2 between nodes from different parents and avoid overlap,
   * the subtree rooted at node J is adjusted with a shift of 1.5.
   *
   * The shift affects the subtree root siblings.
   * For instance, left siblings like node F will adjust by `1.5 * (1 / 2) = 0.75`
   * to maintain centralization within their subtree.
   * Similarly, right siblings will receive the same shift as the node that initiated the shift (node J in this case).
   *
   * In the example, the final X will be as follows:
   *
   * | Node  | prelim | parent's mod | subtree's shift | Final X |
   * | ----- | ------ | ------------ | --------------- | ------- |
   * | E     | 0.5    | 0            | 0               | 0.5     |
   * | F     | 1.5    | 0            | 0.75            | 2.25    |
   * | J     | 2.5    | 0            | 1.5             | 4       |
   * | K     | 3.5    | 0            | 1.5             | 5       |
   * | A & C | 0      | 0            | 0               | 0       |
   * | B & D | 1      | 0            | 0               | 1       |
   * | G     | 0      | 1.5          | 1.5             | 3       |
   * | H     | 1      | 1.5          | 1.5             | 4       |
   * | I     | 2      | 1.5          | 1.5             | 5       |
   */
  console.log('[] root before', inspect(root));
  traverseTreeAfter(root, computeXCoordinateVariables);
  console.log('[] root after', inspect(root));
  // Centralize tree
  root.parent.mod = -root.prelim;
  traverseTreeBefore(root, (node) => {
    resolveXCoordinate(node);
    if (node.id !== ROOT_NODE_ID) setCoordinates(node);
  });

  return root.children ?? [];

  function computeCluster<T extends BaseData>(node: TreeNode<T>): void {
    if (!node.children) {
      return;
    }

    const leafChildrenByGroup: Record<string, ClusterTreeNode<T>[]> = {};
    const groupedChildren: Record<string, TreeNode<T>[]> = {};

    /*
     * Group leaf nodes by their group to determine if they form a cluster.
     */
    node.children.forEach((child) => {
      const groupId = child.group?.id ?? DEFAULT_NODE_GROUP_ID;
      if (!groupedChildren[groupId]) {
        groupedChildren[groupId] = [];
      }
      groupedChildren[groupId].push(child);

      if (!child.children?.length) {
        const groupId = child.group?.id ?? DEFAULT_NODE_GROUP_ID;
        if (!leafChildrenByGroup[groupId]) {
          leafChildrenByGroup[groupId] = [];
        }
        leafChildrenByGroup[groupId].push(child as ClusterTreeNode<T>);
      }
    });

    const groupsWithCluster: string[] = Object.keys(leafChildrenByGroup).filter(
      (group) => leafChildrenByGroup[group].length > 3,
    );

    const hasCluster = groupsWithCluster.length > 0;

    /*
     * Rearrange sibling nodes based on their proximity to either end of the array.
     * Nodes with children should be moved either to the beginning or end of the array,
     * depending on which end they are closer to.
     * Enabling the layout to be as compact as possible.
     */
    const segmentCount = hasCluster ? 4 : 2;
    const segmentSize = node.children.length / segmentCount;

    let runningIndex = 0;
    sortedGroups.forEach((group) => {
      groupedChildren[group]
        ?.sort(getSortNodesWithChildren(segmentCount, segmentSize))
        .forEach((child) => (child.index = runningIndex++));
    });

    node.children.sort((nodeA, nodeB) => nodeA.index - nodeB.index);

    /*
     * The group depth is stored for layout computation
     */
    if (
      sortedGroups.length > MIN_GROUP_COUNT &&
      Object.keys(groupedChildren).length > MIN_GROUP_COUNT
    ) {
      depthWithGroup.add(node.depth + 1);
    }

    /*
     * Node clusters form when there are more than three consecutive sibling leaf nodes in sequence.
     */
    if (!hasCluster) {
      return;
    }

    /*
     * The cluster depth is stored for layout computation
     */
    depthWithCluster.add(node.depth + 1);

    /*
     * Each node within a cluster is annotated with metadata
     */
    groupsWithCluster.forEach((group) => {
      const clusterNodes = leafChildrenByGroup[group];
      clusterNodes.forEach((leafChild, index) => {
        leafChild.cluster = {
          nodes: clusterNodes,
          index,
        };
      });
    });
  }

  function sortNodesByGroup<T extends BaseData>(node: TreeNode<T>): void {
    if (!node.children) {
      return;
    }

    const groupedChildren = node.children.reduce((acc, child) => {
      const groupId = child.group?.id ?? DEFAULT_NODE_GROUP_ID;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }

      acc[groupId].push(child);
      return acc;
    }, {} as Record<string, TreeNode<T>[]>);

    let runningIndex = 0;
    sortedGroups.forEach((group) => {
      groupedChildren[group]?.forEach(
        (child) => (child.index = runningIndex++),
      );
    });

    /*
     * The group depth is stored for layout computation
     */
    if (
      sortedGroups.length > MIN_GROUP_COUNT &&
      Object.keys(groupedChildren).length > MIN_GROUP_COUNT
    ) {
      depthWithGroup.add(node.depth + 1);
    }

    node.children.sort((nodeA, nodeB) => nodeA.index - nodeB.index);
  }

  function computeXCoordinateVariables<T extends BaseData>(
    node: TreeNode<T>,
  ): void {
    const children = node.children;
    const parent = node.parent!;
    const siblings = parent.children;
    const prevSibling = node.index ? siblings![node.index - 1] : null;

    if (children?.length) {
      applyShifts(node);
      let relevantChildren = children;

      /*
       * If there are multiple groups, only consider the children in the default group
       * to determine the midpoint, keeping the default group nodes centralized.
       */
      if (sortedGroups.length > MIN_GROUP_COUNT) {
        const defaultGroupChildren = children.filter(
          (child) => child.group?.id === DEFAULT_NODE_GROUP_ID,
        );

        if (defaultGroupChildren.length) {
          relevantChildren = defaultGroupChildren;
        }
      }

      const firstChildPrelim = relevantChildren[0].prelim;
      const lastChildPrelim =
        relevantChildren[relevantChildren.length - 1].prelim;
      const midpoint = (firstChildPrelim + lastChildPrelim) / 2;

      if (prevSibling) {
        /*
         * For non-leftmost node with children:
         * 1. Set prelim to the prelim of the previous sibling plus the separation distance.
         * 2. Adjust mod to center the node's descendants below it.
         */
        node.prelim = prevSibling.prelim + separation(node, prevSibling);
        node.mod = node.prelim - midpoint;
      } else {
        /*
         * For the leftmost node with children:
         * Center the node directly above the midpoint of its children.
         */
        node.prelim = midpoint;
      }
    } else if (prevSibling) {
      if (isClusterNodeInSecondRow(node)) {
        const firstRowClusterNode = getFirstRowClusterNode(node);
        /*
         * For non-leftmost node without children in the second row of a cluster:
         * Set prelim to the prelim of the node immediately above it.
         */
        node.prelim = firstRowClusterNode.prelim;
      } else {
        /*
         * For non-leftmost node without children:
         * Set prelim to the prelim of the previous sibling plus the separation distance.
         */
        node.prelim = prevSibling.prelim + separation(node, prevSibling);
      }
    }

    /*
     * The apportion function computes shift adjustments
     * to ensure that sibling subtrees are properly spaced apart and don't overlap.
     */
    parent.rootAncestor = apportion(
      node,
      prevSibling,
      parent.rootAncestor || siblings![0],
    );
  }

  function resolveXCoordinate<T extends BaseData>(node: TreeNode<T>): void {
    node.x = node.prelim + node.parent!.mod;
    node.mod += node.parent!.mod;
  }

  /**
   * Combines a new subtree with previous subtrees.
   * Uses threads to traverse the inside and outside contours of the left and right
   * subtrees up to the highest common level.
   * Vertices for the traversals are currentInsideRight, currentInsideLeft,
   * currentOutsideLeft, and currentOutsideRight.
   * For summing up the modifiers along the contour, use modInsideRight, modInsideLeft,
   * modOutsideLeft, and modOutsideRight.
   * When two nodes of the inside contours conflict, compute the left one of the
   * greatest uncommon ancestors using nextAncestor and call moveSubtree to shift
   * the subtree and prepare the shifts of smaller subtrees.
   * Finally, add a new thread if necessary.
   */
  function apportion<T extends BaseData>(
    node: TreeNode<T>,
    previousSibling: TreeNode<T> | null,
    ancestor: TreeNode<T>,
  ): TreeNode<T> {
    if (previousSibling) {
      let currentInsideRight = node;
      let currentInsideLeft = node;
      let currentOutsideLeft = previousSibling;
      let currentOutsideRight = currentInsideRight.parent!.children![0];

      let modInsideRight = currentInsideRight.mod;
      let modInsideLeft = currentInsideLeft.mod;
      let modOutsideLeft = currentOutsideLeft.mod;
      let modOutsideRight = currentOutsideRight.mod;
      let shift;

      // Traverse the contour of the tree
      while (
        ((currentOutsideLeft = nextRight(currentOutsideLeft)!),
        (currentInsideRight = nextLeft(currentInsideRight)!),
        currentOutsideLeft && currentInsideRight)
      ) {
        currentOutsideRight = nextLeft(currentOutsideRight)!;
        currentInsideLeft = nextRight(currentInsideLeft)!;
        currentInsideLeft.ancestor = node;

        // Calculate the shift required to avoid overlap
        shift =
          currentOutsideLeft.prelim +
          modOutsideLeft -
          currentInsideRight.prelim -
          modInsideRight +
          separation(currentOutsideLeft, currentInsideRight);

        if (shift > 0) {
          // Apply the shift to move the subtree
          moveSubtree(
            nextAncestor(currentOutsideLeft, node, ancestor),
            node,
            shift,
          );

          // Adjust modifiers accordingly
          modInsideRight += shift;
          modInsideLeft += shift;
        }

        // Update the modifiers for the next iteration
        modOutsideLeft += currentOutsideLeft.mod;
        modInsideRight += currentInsideRight.mod;
        modOutsideRight += currentOutsideRight.mod;
        modInsideLeft += currentInsideLeft.mod;
      }

      // Handle threads (temporary links to facilitate traversal) for remaining nodes
      if (currentOutsideLeft && !nextRight(currentInsideLeft)) {
        currentInsideLeft.thread = currentOutsideLeft;
        currentInsideLeft.mod += modOutsideLeft - modInsideLeft;
      }
      if (currentInsideRight && !nextLeft(currentOutsideRight)) {
        currentOutsideRight.thread = currentInsideRight;
        currentOutsideRight.mod += modInsideRight - modOutsideRight;
        ancestor = node;
      }
    }
    return ancestor;
  }

  function setCoordinates<T extends BaseData>(node: TreeNode<T>): void {
    const parentY = node.parent?.y ?? 0;
    const parentDepth = node.parent?.depth ?? 0;
    const isSecondRowClusterNode = isClusterNodeInSecondRow(node);

    let x = node.x * horizontalNodeSpacing;
    let y = parentY + verticalNodeSpacing;

    // Starts first depth at the top
    if (node.depth === 1) {
      y = 0;
    }

    // Increment y with vertical cluster spacing if parent's depth has a cluster node
    if (depthWithCluster.has(parentDepth)) {
      y += verticalClusterNodeSpacing;
    }

    // Increment y with vertical cluster spacing if parent's depth has a groups
    if (depthWithGroup.has(parentDepth)) {
      y += verticalGroupsSpacing + (groupPadding.bottom || 0);
    }

    // Increment y with vertical cluster spacing if depth has a groups
    if (depthWithGroup.has(node.depth) && node.depth > 1) {
      y += verticalGroupsSpacing + (groupPadding.top || 0);
    }

    // Increment y with vertical cluster spacing if it's a cluster on the second row
    if (isSecondRowClusterNode) {
      y += verticalClusterNodeSpacing;
    }

    // Adjust x to centralize second row nodes if it's a node on the second row of an odd cluster
    if (isSecondRowClusterNode && node.cluster.nodes.length % 2 !== 0) {
      x -= horizontalNodeSpacing / 2;
    }

    node.x = Math.floor(x);
    node.y = y;
    node.position = {
      x: node.x,
      y: node.y,
    };
  }

  function separation<T extends BaseData>(
    leftNode: TreeNode<T>,
    rightNode: TreeNode<T>,
  ): number {
    let separation = 1;

    // Increase separation between subtrees
    if (leftNode.parent !== rightNode.parent) {
      separation += horizontalSubTreeSpacing;
    }

    // Increase separation between groups
    if (leftNode.group?.id !== rightNode.group?.id) {
      separation += horizontalGroupsSpacing;
    }

    // Reset separation if either node is hidden
    if (leftNode.hidden || rightNode.hidden) {
      separation = 1;
    }

    return separation;
  }
}

function createRootNode<T extends BaseData>(
  nodes: TreeNode<T>[],
): TreeNode<T> & { parent: TreeNode<T> } {
  const root = {
    id: ROOT_NODE_ID,
    rootAncestor: null,
    thread: null,
    prelim: 0,
    mod: 0,
    change: 0,
    shift: 0,
    x: 0,
    y: 0,
    cluster: null,
    children: nodes,
    depth: 0,
  } as unknown as TreeNode<T> & { parent: TreeNode<T> };

  root.parent = { children: [root] } as TreeNode<T>;
  root.ancestor = root;
  nodes.forEach((node) => (node.parent = root));

  return root;
}

/*
 * Sorts groups in a way that the default group is in the center.
 */
function sortGroups(groups?: string[]): string[] {
  if (!groups?.length) {
    return [DEFAULT_NODE_GROUP_ID];
  }

  const defaultIndex = Math.floor(groups.length / 2);
  const leftPart = groups.slice(0, defaultIndex);
  const rightPart = groups.slice(defaultIndex);

  return [...leftPart, DEFAULT_NODE_GROUP_ID, ...rightPart];
}

function applyShifts<T extends BaseData>(node: TreeNode<T>): void {
  let shift = 0;
  let change = 0;
  const children = node.children!;
  let i = children.length;
  let child: TreeNode<T>;

  // Middle clusters are clusters between sibling nodes that have children.
  const middleClusterNodes = getMiddleClusterSiblings(children);

  while (--i >= 0) {
    child = children[i];

    // Avoids applying shifts to middle cluster nodes to keep them tightly spaced
    if (
      !middleClusterNodes ||
      i > middleClusterNodes[middleClusterNodes.length - 1].index ||
      i < middleClusterNodes[0].index
    ) {
      child.prelim += shift;
      child.mod += shift;
    }

    change += child.change;
    shift += child.shift + change;
  }

  // Position middle cluster in between siblings
  if (middleClusterNodes) {
    const lastClusterNode = middleClusterNodes[middleClusterNodes.length - 1];
    const nodeAfterCluster = children[lastClusterNode.index + 1];
    const separation = 1;

    const remainingSpace =
      nodeAfterCluster.prelim - lastClusterNode.prelim - separation;

    middleClusterNodes.forEach((node) => {
      node.prelim += remainingSpace / 2;
    });
  }
}

/*
 * Invokes the callback function for node and each descendant in post-order traversal,
 * such that a given node is only visited after all of its descendants have already been visited.
 * The tree example will be traversed in alphabetical order:
 * ```
 *      E
 *     / \
 *    C   D
 *   / \
 *  A   B
 * ```
 */
function traverseTreeAfter<T extends BaseData>(
  node: TreeNode<T>,
  callback: (node: TreeNode<T>) => void,
): void {
  let currentNode: TreeNode<T> | undefined = node;
  const nodes: TreeNode<T>[] = [currentNode];
  const nextNodes: TreeNode<T>[] = [];
  let children: TreeNode<T>[] | null = null;

  while ((currentNode = nodes.pop())) {
    nextNodes.push(currentNode);
    if ((children = currentNode.children)) {
      for (let i = 0, n = children.length; i < n; ++i) {
        nodes.push(children[i]);
      }
    }
  }
  console.log(
    '[] next nodes',
    nextNodes.map((n) => n.id),
  );
  while ((currentNode = nextNodes.pop())) {
    callback(currentNode);
  }
}

/*
 * Invokes the callback function for node and each descendant in pre-order traversal,
 * such that a given node is only visited after all of its ancestors have already been visited.
 * The tree example will be traversed in alphabetical order:
 * ```
 *      A
 *     / \
 *    B   C
 *   / \
 *  D   E
 * ```
 */
function traverseTreeBefore<T extends BaseData>(
  node: TreeNode<T>,
  callback: (node: TreeNode<T>) => void,
): void {
  let currentNode: TreeNode<T> | undefined = node;
  const nodes: TreeNode<T>[] = [currentNode];
  let children: TreeNode<T>[] | null = null;

  while ((currentNode = nodes.pop())) {
    callback(currentNode);
    if ((children = currentNode.children)) {
      for (let i = children.length - 1; i >= 0; --i) {
        nodes.push(children[i]);
      }
    }
  }
}

function moveSubtree<T extends BaseData>(
  rightContourNode: TreeNode<T>,
  leftContourNode: TreeNode<T>,
  shift: number,
): void {
  const change = shift / (leftContourNode.index - rightContourNode.index);
  rightContourNode.change += change;
  leftContourNode.change -= change;
  leftContourNode.shift += shift;
  leftContourNode.prelim += shift;
  leftContourNode.mod += shift;
}

function nextLeft<T extends BaseData>(node: TreeNode<T>): TreeNode<T> | null {
  const children = node.children;
  return children ? children[0] : node.thread;
}

function nextRight<T extends BaseData>(node: TreeNode<T>): TreeNode<T> | null {
  const children = node.children;
  return children ? children[children.length - 1] : node.thread;
}

function nextAncestor<T extends BaseData>(
  currentNode: TreeNode<T>,
  node: TreeNode<T>,
  ancestor: TreeNode<T>,
): TreeNode<T> {
  return currentNode.ancestor!.parent === node.parent
    ? currentNode.ancestor!
    : ancestor;
}

/**
 * Retrieve clusters between sibling nodes that have children.
 */
function getMiddleClusterSiblings<T extends BaseData>(
  children: TreeNode<T>[],
): ClusterTreeNode<T>[] | undefined {
  if (children.length < 6) {
    return;
  }

  const firstChild = children[0];

  if (!(firstChild && firstChild.children?.length && !firstChild.cluster)) {
    return;
  }

  const lastChild = children[children.length - 1];

  if (!(lastChild && lastChild.children && !lastChild.cluster)) {
    return;
  }

  const clusterChild = children.find((child) => !!child.cluster) as
    | ClusterTreeNode<T>
    | undefined;

  return clusterChild?.cluster.nodes;
}

function getFirstRowClusterNode<T extends BaseData>(
  node: ClusterTreeNode<T>,
): ClusterTreeNode<T> {
  const clusterIndex = node.cluster.index;
  const halfClusterLength = Math.floor(node.cluster.nodes.length / 2);
  return node.cluster.nodes[clusterIndex - halfClusterLength];
}

/*
 * Nodes with children are position one the closest extremes ends of the array.
 */
function getSortNodesWithChildren<T extends BaseData>(
  segmentCount: 2 | 4,
  segmentSize: number,
) {
  return (nodeA: TreeNode<T>, nodeB: TreeNode<T>) =>
    sortNodesWithChildren(nodeA, segmentCount, segmentSize) -
    sortNodesWithChildren(nodeB, segmentCount, segmentSize);
}

function sortNodesWithChildren<T extends BaseData>(
  { index, children }: TreeNode<T>,
  segmentCount: 2 | 4,
  segmentSize: number,
) {
  if (!children || children.length === 0) {
    return 0; // Nodes without children stay in their relative positions.
  }

  // Determine the quarter the node belongs to and return the appropriate weight
  if (segmentCount === 4) {
    if (index < segmentSize) {
      // First quarter
      return -2;
    } else if (index < 2 * segmentSize) {
      // Second quarter
      return 2;
    } else if (index < 3 * segmentSize) {
      // Third quarter
      return -1;
    } else {
      // Fourth quarter
      return 1;
    }
  } else {
    // Determine if the node is in the first or second half
    return index < segmentSize ? -1 : 1;
  }
}
