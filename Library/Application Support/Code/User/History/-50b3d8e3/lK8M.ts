import type { ComponentType, CSSProperties } from 'react';

import type {
  BaseData as BaseInterface,
  ExtendedHierarchicalNode,
} from '@personio-web/employees-organizations-hook-use-hierarchical-data';

import type {
  Dimensions,
  EdgeProps,
  Node as BaseNode,
  NodeProps,
  ReactFlowProps,
  XYPosition,
} from 'reactflow';

export type NodeTypes<K extends string = string> = {
  [key in K]: ComponentType<NodeProps>;
};

export type Node<T extends BaseData> = BaseNode<T> & XYPosition;

export enum RelationshipType {
  Child = 'child',
  Parent = 'parent',
}

export type GroupData = {
  id: string;
  relatedNodeId?: string;
  relationshipType?: RelationshipType;
};

export type BaseData = BaseInterface & {
  type?: string;
  group?: GroupData;
  hidden?: boolean;
};

/*
 * Tree node
 */
export type ExtendedTreeNode<T extends BaseData> = {
  id: string;
  /*
   * Properties for computing coordinates
   */
  rootAncestor: TreeNode<T> | null;
  ancestor: TreeNode<T>;
  thread: TreeNode<T> | null;
  prelim: number;
  mod: number;
  change: number;
  shift: number;
  x: number;
  y: number;
  /*
   * Cluster properties
   */
  cluster: {
    nodes: ClusterTreeNode<T>[];
    index: number;
  } | null;

  /*
   * Properties for displaying with reactflow
   */
  type: string;
  hidden: boolean;
  group?: GroupData;
  position: XYPosition;
  focusable: boolean;
};

export type TreeNode<T extends BaseData> = ExtendedHierarchicalNode<
  T,
  ExtendedTreeNode<T>
>;

export type ClusterTreeNode<T extends BaseData> = TreeNode<T> & {
  cluster: NonNullable<TreeNode<T>['cluster']>;
};

export type GroupedTreeNode<T extends BaseData> = TreeNode<T> & {
  group: NonNullable<TreeNode<T>['group']>;
};

export type GroupedNode<T extends BaseData> = Pick<
  NonNullable<ExtendedTreeNode<T>>,
  'id' | 'type' | 'position'
> & {
  data: Dimensions & GroupData;
};

/*
 * Edges
 */
export type EdgeType = 'default';

export type EdgeTypes = {
  [key in EdgeType]: ComponentType<EdgeProps>;
};

export type TreeEdgesData = {
  isActive?: boolean;
  groupId?: string;
};

export type TreeEdges = {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  style?: CSSProperties;
  data: TreeEdgesData;
};

/*
 * Tree Layout
 *
 * 'horizontal' mode represents a tree that spreads horizontally,
 * while 'compact' mode is a tree layout with clusters,
 * where non-expanded sibling nodes are displayed in 2 rows,
 * creating a more compact layout.
 */
export type TreeLayoutModes = 'horizontal' | 'compact';

export type TreeLayoutOptions = {
  nodeSize?: {
    width: number;
    height: number;
  };
  mode?: TreeLayoutModes;
  groups?: string[];
  getEdgeStyle?: (edge: TreeEdges) => CSSProperties | undefined;
  spacing?: {
    /*
     * Minimum spacing between sibling nodes.
     */
    sibling: number;
    /*
     * Minimum vertical spacing between a parent node and its child nodes.
     */
    children: number;
    /*
     * Minimum horizontal spacing between subtrees.
     */
    subtrees: number;
    /*
     * Minimum spacing increased between groups vertically on top of the
     * children spacing and horizontally on top of the subtrees spacing.
     */
    groups: number;
  };
  /*
   * Added padding around a group node.
   */
  groupPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
};

type OnInit = Pick<Partial<ReactFlowProps>, 'onInit'>;
export type TreeLayoutProps<T extends BaseData> = TreeLayoutOptions &
  Pick<Partial<ReactFlowProps>, 'onInit'> & {
    rootNodes: TreeNode<T>[];
    nodeTypes: NodeTypes;
    interactive?: boolean;
  };

/*
 * Export
 */
export enum ExportFormat {
  JPEG = 'JPEG',
  PNG = 'PNG',
  SVG = 'SVG',
  PDF = 'PDF',
}
