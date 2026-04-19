import { inspect } from 'util';
import { defaultTreeLayoutOptions } from '../constants';
import {
  type BaseData,
  type ClusterTreeNode,
  type GroupedNode,
  RelationshipType,
  type TreeNode,
} from '../types';
import { mapEdges } from './mapEdges';

describe('mapEdges', () => {
  const layoutOptions = {
    ...defaultTreeLayoutOptions,
    nodeSize: { width: 100, height: 100 },
    spacing: {
      ...defaultTreeLayoutOptions.spacing,
      sibling: 10,
    },
  };

  const rootNode = {
    id: 'Root',
    x: 110,
    y: 0,
    depth: 1,
    children: [],
    data: {},
  };
  const nodeA = { id: 'A', x: 0, y: 110, depth: 2, children: [], data: {} };
  const nodeB = { id: 'B', x: 110, y: 110, depth: 2, children: [], data: {} };
  const nodeC = { id: 'C', x: 220, y: 110, depth: 2, children: [], data: {} };
  const nodeD = { id: 'D', x: 0, y: 215, depth: 2, children: [], data: {} };
  const nodeE = { id: 'E', x: 110, y: 215, depth: 2, children: [], data: {} };
  const nodeF = { id: 'F', x: 220, y: 215, depth: 2, children: [], data: {} };

  it('should map edges between root and its children', () => {
    const mockRootNode = { ...rootNode, children: [nodeA, nodeB, nodeC] };
    const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
    const edges = mapEdges({ treeNodes, layoutOptions });

    expect(edges).toHaveLength(2);
    expect(edges).toEqual([
      {
        id: 'Root-A',
        source: 'Root',
        target: 'A',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
      {
        id: 'Root-C',
        source: 'Root',
        target: 'C',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
    ]);
  });

  it('should handle edge creation between spaced out nodes', () => {
    const mockNodeB = { ...nodeB, x: 500 };
    const mockNodeC = { ...nodeC, x: 610 };
    const mockRootNode = {
      ...rootNode,
      children: [nodeA, mockNodeB, mockNodeC],
    };
    const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
    const edges = mapEdges({ treeNodes, layoutOptions });

    expect(edges).toHaveLength(3);
    expect(edges).toEqual([
      {
        id: 'Root-A',
        source: 'Root',
        target: 'A',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
      {
        id: 'Root-B',
        source: 'Root',
        target: 'B',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
      {
        id: 'Root-C',
        source: 'Root',
        target: 'C',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
    ]);
  });

  it('should get edge styles correctly', () => {
    const mockRootNode = {
      ...rootNode,
      children: [nodeA, nodeB, nodeC],
    };
    const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
    const edgeStyle = {
      stroke: 'var(--ds-color-gray-5)',
      strokeWidth: 2,
    };
    const edges = mapEdges({
      treeNodes,
      layoutOptions: {
        ...layoutOptions,
        getEdgeStyle: () => edgeStyle,
      },
    });

    expect(edges).toHaveLength(2);
    expect(edges).toEqual([
      {
        id: 'Root-A',
        source: 'Root',
        target: 'A',
        type: 'default',
        style: edgeStyle,
        data: expect.any(Object),
      },
      {
        id: 'Root-C',
        source: 'Root',
        target: 'C',
        type: 'default',
        style: edgeStyle,
        data: expect.any(Object),
      },
    ]);
  });

  it('should map edges for clustered nodes', () => {
    const clusterNodes = [nodeA, nodeB, nodeC, nodeD, nodeE, nodeF];
    clusterNodes.forEach((node, i) => {
      (node as unknown as TreeNode<BaseData>)['cluster'] = {
        index: i,
        nodes: clusterNodes as unknown as ClusterTreeNode<BaseData>[],
      };
    });

    const mockRootNode = { ...rootNode, children: clusterNodes };
    const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
    const edges = mapEdges({ treeNodes, layoutOptions });

    expect(edges).toHaveLength(2);
    expect(edges).toEqual([
      {
        id: 'Root-A',
        source: 'Root',
        target: 'A',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
      {
        id: 'Root-C',
        source: 'Root',
        target: 'C',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
    ]);
  });

  it('should handle a scenario where there are no edges to map', () => {
    const treeNodes = [] as unknown as TreeNode<BaseData>[];
    const edges = mapEdges({ treeNodes, layoutOptions });

    expect(edges).toHaveLength(0);
  });

  it('should prioritize active edges when sorting', () => {
    const mockNodeA = {
      ...nodeA,
      data: { ...nodeA.data, isActive: true },
    };
    const mockRootNode = {
      ...rootNode,
      data: { ...rootNode.data, isActive: true },
      children: [mockNodeA, nodeB, nodeC],
    };
    const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
    const edges = mapEdges({ treeNodes, layoutOptions });

    expect(edges[0].data.isActive).toBe(false);
    expect(edges[1].data.isActive).toBe(true);
  });

  it('should map edges for group nodes', () => {
    const groupNodes = [
      {
        id: 'Group1',
        data: {
          id: 'Group1',
          relatedNodeId: 'A',
          relationshipType: RelationshipType.Parent,
        },
      },
      {
        id: 'Group2',
        data: {
          id: 'Group2',
          relatedNodeId: 'B',
          relationshipType: RelationshipType.Child,
        },
      },
    ] as GroupedNode<BaseData>[];
    const mockRootNode = { ...rootNode, children: [nodeA, nodeB, nodeC] };
    const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
    const edges = mapEdges({ treeNodes, groupNodes, layoutOptions });

    expect(edges).toHaveLength(4);
    expect(edges).toEqual([
      {
        id: 'Root-A',
        source: 'Root',
        target: 'A',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
      {
        id: 'Root-C',
        source: 'Root',
        target: 'C',
        type: 'default',
        style: expect.any(Object),
        data: expect.any(Object),
      },
      {
        id: 'Group1-A',
        source: 'Group1',
        target: 'A',
        type: 'default',
        style: expect.any(Object),
        data: expect.objectContaining({ groupId: 'Group1' }),
      },
      {
        id: 'B-Group2',
        source: 'B',
        target: 'Group2',
        type: 'default',
        style: expect.any(Object),
        data: expect.objectContaining({ groupId: 'Group2' }),
      },
    ]);
  });

  describe('indicate active edges', () => {
    it('should render a middle active edge when middle node is active', () => {
      const mockNodeB = {
        ...nodeB,
        data: { ...nodeB.data, isActive: true },
      };
      const mockRootNode = {
        ...rootNode,
        data: { ...rootNode.data, isActive: true },
        children: [nodeA, mockNodeB, nodeC],
      };
      const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
      const edges = mapEdges({ treeNodes, layoutOptions });

      expect(edges).toHaveLength(3);
      expect(edges).toEqual([
        {
          id: 'Root-A',
          source: 'Root',
          target: 'A',
          type: 'default',
          style: expect.any(Object),
          data: expect.any(Object),
        },
        {
          id: 'Root-C',
          source: 'Root',
          target: 'C',
          type: 'default',
          style: expect.any(Object),
          data: expect.any(Object),
        },
        {
          id: 'Root-B',
          source: 'Root',
          target: 'B',
          type: 'default',
          style: expect.any(Object),
          data: expect.objectContaining({ isActive: true }),
        },
      ]);
    });

    it('should render a middle active edge when 2nd rows middle node is active', () => {
      const mockNodeE = {
        ...nodeE,
        data: { ...nodeE.data, isActive: true },
      };
      const clusterNodes = [nodeA, nodeB, nodeC, nodeD, mockNodeE, nodeF];
      clusterNodes.forEach((node, i) => {
        (node as unknown as TreeNode<BaseData>)['cluster'] = {
          index: i,
          nodes: clusterNodes as unknown as ClusterTreeNode<BaseData>[],
        };
      });
      const mockRootNode = {
        ...rootNode,
        data: { ...rootNode.data, isActive: true },
        children: [nodeA, nodeB, nodeC, nodeD, mockNodeE, nodeF],
      };
      const treeNodes = [mockRootNode] as unknown as TreeNode<BaseData>[];
      const edges = mapEdges({ treeNodes, layoutOptions });

      expect(edges).toHaveLength(3);
      console.log('[]', inspect(edges));
      expect(edges).toEqual([
        {
          id: 'Root-A',
          source: 'Root',
          target: 'A',
          type: 'default',
          style: expect.any(Object),
          data: expect.any(Object),
        },
        {
          id: 'Root-C',
          source: 'Root',
          target: 'C',
          type: 'default',
          style: expect.any(Object),
          data: expect.any(Object),
        },
        {
          id: 'Root-B',
          source: 'Root',
          target: 'B',
          type: 'default',
          style: expect.any(Object),
          data: expect.objectContaining({ isActive: true }),
        },
      ]);
    });
  });
});
