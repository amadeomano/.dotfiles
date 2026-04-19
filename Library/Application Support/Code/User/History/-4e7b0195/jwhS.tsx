import { screen } from '@testing-library/react';
import { renderWithWrapper } from '@personio-web/config-jest/helpers';

import { type HierarchicalNode } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { type EntityNode } from '@personio-web/employees-organizations-feature-org-chart';

import { NodeMap } from '../../../../../Nodes/constants';
import { TestIds } from '../../../../../utils/test-ids';
import { SpanOfControl } from './SpanOfControl';

type Node = HierarchicalNode<EntityNode>;

describe('SpanOfControl', () => {
  const createMockNode = (overrides: Partial<Node> = {}): Node =>
    ({
      id: 'test-node',
      data: {
        type: NodeMap.OrgUnit,
      },
      children: [],
      descendants: [],
      ...overrides,
    } as Node);

  describe('Basic Rendering', () => {
    it('should render span of control with direct subordinates', () => {
      const mockNode = createMockNode({
        children: [
          { data: { type: NodeMap.OrgUnit } } as Node,
          { data: { type: NodeMap.OrgUnit } } as Node,
        ],
        descendants: [
          { id: 'test-node', data: { type: NodeMap.OrgUnit } } as Node,
          { id: 'child-1', data: { type: NodeMap.OrgUnit } } as Node,
          { id: 'child-2', data: { type: NodeMap.OrgUnit } } as Node,
        ],
      });

      renderWithWrapper(
        <SpanOfControl node={mockNode} type="ORG_UNIT_TYPE_DEPARTMENT" />,
      );

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toBeVisible();
      expect(spanOfControl).toHaveTextContent('2');
    });

    it('should render span of control with total subordinates', () => {
      const mockNode = createMockNode({
        children: [{ data: { type: NodeMap.OrgUnit } } as Node],
        descendants: [
          { id: 'test-node', data: { type: NodeMap.OrgUnit } } as Node,
          { id: 'child-1', data: { type: NodeMap.OrgUnit } } as Node,
          { id: 'grandchild-1', data: { type: NodeMap.OrgUnit } } as Node,
        ],
      });

      renderWithWrapper(
        <SpanOfControl node={mockNode} type="ORG_UNIT_TYPE_DEPARTMENT" />,
      );

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toHaveTextContent('1 (2)');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render without subordinates count when node has no children', () => {
      const mockNode = createMockNode({
        children: [],
        descendants: [
          { id: 'test-node', data: { type: NodeMap.OrgUnit } } as Node,
        ],
      });

      renderWithWrapper(
        <SpanOfControl node={mockNode} type="ORG_UNIT_TYPE_DEPARTMENT" />,
      );

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toBeVisible();
      expect(spanOfControl).not.toHaveTextContent('0');
    });

    it('should not render when type is ORG_UNIT_TYPE_UNSPECIFIED', () => {
      const mockNode = createMockNode({
        children: [{ data: { type: NodeMap.OrgUnit } } as Node],
      });

      renderWithWrapper(
        <SpanOfControl node={mockNode} type="ORG_UNIT_TYPE_UNSPECIFIED" />,
      );

      expect(
        screen.queryByTestId(TestIds.SpanOfControl),
      ).not.toBeInTheDocument();
    });

    it('should filter out unmatched org units from direct count', () => {
      const mockNode = createMockNode({
        children: [
          { data: { type: NodeMap.OrgUnit } } as Node,
          { data: { type: NodeMap.UnmatchedOrgUnit } } as Node,
        ],
        descendants: [
          { id: 'test-node', data: { type: NodeMap.OrgUnit } } as Node,
          { id: 'child-1', data: { type: NodeMap.OrgUnit } } as Node,
        ],
      });

      renderWithWrapper(
        <SpanOfControl node={mockNode} type="ORG_UNIT_TYPE_TEAM" />,
      );

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toHaveTextContent('1');
    });

    it('should filter out unmatched org units from total count', () => {
      const mockNode = createMockNode({
        children: [{ data: { type: NodeMap.OrgUnit } } as Node],
        descendants: [
          { id: 'test-node', data: { type: NodeMap.OrgUnit } } as Node,
          { id: 'child-1', data: { type: NodeMap.OrgUnit } } as Node,
          {
            id: 'unmatched-1',
            data: { type: NodeMap.UnmatchedOrgUnit },
          } as Node,
        ],
      });

      renderWithWrapper(
        <SpanOfControl node={mockNode} type="ORG_UNIT_TYPE_DEPARTMENT" />,
      );

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toHaveTextContent('1');
    });
  });
});
