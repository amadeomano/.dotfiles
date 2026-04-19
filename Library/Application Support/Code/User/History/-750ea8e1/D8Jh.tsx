import { waitFor } from '@testing-library/react';

import {
  ListOrgUnitsHierarchyHandlers,
  ListOrgUnitsHierarchyCustomHandlers,
} from '@personio-web/employees-organizations-gofer/mocking';
import { server } from '@personio-web/mocks/server';
import { type TestWrapperProps } from '@personio-web/orchestrator-common/test-utils';

import { renderHookWithWrapper } from '../../../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { NodeMap } from '../../../Nodes/constants';
import { type Source } from '../../preferences/types';
import { useCompleteHierarchy } from './useCompleteHierarchy';

const renderTestHook = (
  source: Source = 'Department',
  enabled = true,
  options?: TestWrapperProps,
) =>
  renderHookWithWrapper(() => useCompleteHierarchy({ enabled }), {
    ...options,
    innerWrapper: ({ children }) => (
      <MockOrgChartPreferencesContext source={source}>
        {children}
      </MockOrgChartPreferencesContext>
    ),
  });

describe('useCompleteHierarchy (OrgUnit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return complete hierarchy structure with proper loading state', async () => {
      server.use(ListOrgUnitsHierarchyHandlers.defaultHandler);

      const { result } = renderTestHook('Department');

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toBeDefined();
      expect(result.current.data.hierarchy).toBeDefined();
      expect(result.current.data.hierarchy.nodes).toBeDefined();
      expect(result.current.data.includedRootIds).toBeDefined();
      expect(result.current.data.hiddenRootIds).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should transform org units to EntityNode format correctly', async () => {
      server.use(ListOrgUnitsHierarchyHandlers.defaultHandler);

      const { result } = renderTestHook('Department');

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const nodes = result.current.data.hierarchy.nodes;

      // Check that all nodes have the correct EntityNode structure
      nodes.forEach((node) => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('data');
        expect(node.data).toHaveProperty('parent_id');
        expect(node.data).toHaveProperty('entity_id');
        expect(node.data).toHaveProperty('directMemberCount');
        expect(node.data).toHaveProperty('type');
        expect(node.data.type).toBe(NodeMap.OrgUnit);
        expect(node.id).toBe(node.data.entity_id);
      });
    });

    it('should correctly filter out nodes without subnote or direct member count', async () => {
      server.use(ListOrgUnitsHierarchyCustomHandlers.customHandler);

      const { result } = renderTestHook('Department');

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const nodeIds = result.current.data.hierarchy.nodes.map(
        (node) => node.data.id,
      );
      expect(nodeIds).toEqual(['root-1', 'unit-2', 'sub-unit-2-1', 'root-2']);
    });
  });

  describe('loading states', () => {
    it('should handle disabled queries correctly', async () => {
      server.use(ListOrgUnitsHierarchyHandlers.defaultHandler);

      const { result } = renderTestHook('Department', false);

      // When disabled, the query might not be loading and should return empty data
      expect(result.current.data.hierarchy.nodes).toHaveLength(0);
      expect(result.current.data.includedRootIds).toEqual([]);
      expect(result.current.data.hiddenRootIds).toEqual([]);
    });
  });

  describe('data transformation edge cases', () => {
    it('should properly separate root and leaf nodes', async () => {
      server.use(ListOrgUnitsHierarchyHandlers.defaultHandler);

      const { result } = renderTestHook('Department');

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const nodes = result.current.data.hierarchy.nodes;
      const rootIds = result.current.data.includedRootIds;

      // Check that root IDs correspond to nodes with null parent_id
      rootIds.forEach((rootId) => {
        const rootNode = nodes.find((node) => node.id === rootId);
        expect(rootNode).toBeDefined();
        expect(rootNode?.data.parent_id).toBeNull();
      });

      // Check that non-root nodes have non-null parent_id
      const nonRootNodes = nodes.filter((node) => !rootIds.includes(node.id));
      nonRootNodes.forEach((node) => {
        expect(node.data.parent_id).not.toBeNull();
      });
    });

    it('should calculate leadsCount as the maximum number of leads across all org units', async () => {
      server.use(ListOrgUnitsHierarchyHandlers.defaultHandler);

      const { result } = renderTestHook('Department');

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data.source).toBe('Department');
      expect(result.current.data).toHaveProperty('leadsCount', 2);
    });
  });
});
