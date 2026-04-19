import type { NodeTypes, TreeLayoutOptions } from '../TreeLayout/types';

import { GroupNode, LoadingNode, PersonNode, PositionNode } from '../Nodes';
import { NodeType } from '../types';

export const nodeWidth = 262;

export const nodeTypes: NodeTypes<NodeType> = {
  [NodeType.Person]: PersonNode,
  [NodeType.UnmatchedPerson]: PersonNode,
  [NodeType.Loading]: LoadingNode,
  [NodeType.Position]: PositionNode,
  [NodeType.Group]: GroupNode,
  [NodeType.Hidden]: () => null,
};

export const treeLayoutStaticProps: Partial<TreeLayoutOptions> = {
  spacing: {
    sibling: 8,
    children: 96,
    subtrees: 48,
    groups: 48,
  },
  groupPadding: {
    top: 64,
    right: 16,
    bottom: 20,
    left: 16,
  },
};
