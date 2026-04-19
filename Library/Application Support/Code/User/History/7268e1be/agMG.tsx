import { type ContextType, useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';

import { stratify } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { toaster } from 'designSystem/component/toaster';

import { renderHookWithWrapper } from '../../test-setup/testHelpers';

import { OrgChartDataSourceContext, useViewportActions } from '.';

import { type EntityNode, NodeType } from '../types';
import { TreeLayoutProvider, TreeLayout } from '../TreeLayout';
import { nodeTypes, treeLayoutStaticProps } from '../OrgChartTree/constants';

const initialData: EntityNode[] = [
  {
    id: '0', // Root
    entity_id: '0', // Root
    parent_id: null,
    type: NodeType.Person,
  },
];
const expandedData: EntityNode[] = [
  {
    id: '0', // Root
    entity_id: '0', // Root
    parent_id: null,
    type: NodeType.Person,
  },
  {
    id: '1',
    entity_id: '1',
    parent_id: '0',
    type: NodeType.Person,
  },
  {
    id: '2',
    entity_id: '2',
    parent_id: '0',
    type: NodeType.Person,
  },
  {
    id: '3',
    entity_id: '3',
    parent_id: '0',
    type: NodeType.Person,
  },
  {
    id: '4',
    entity_id: '4',
    parent_id: '1',
    type: NodeType.Person,
  },
];

const notifySpy = jest.spyOn(toaster, 'notify');

type Hierarchy = ReturnType<typeof stratify<EntityNode>>;
type DataSource = ContextType<typeof OrgChartDataSourceContext>;

const setExpanded = jest.fn();
const setActiveNodeIds = jest.fn();

const renderHookWithProvider = (props?: Partial<DataSource>) => {
  const Provider = ({ children }: React.PropsWithChildren) => {
    const initialHierarchy: Hierarchy = stratify(initialData);
    const [hierarchy, setHierarchy] = useState<Hierarchy>(initialHierarchy);

    // Simulate expansion / update of the chart nodes
    useEffect(() => {
      const newHierarchy = stratify(expandedData);
      setTimeout(() => setHierarchy(newHierarchy), 0);
    }, []);

    const nodes = hierarchy[0].flatMap((node) => Array.from(node));
    const dataSource: Partial<DataSource> = {
      displayableHierarchy: {
        rootNodes: hierarchy[0],
        nodes,
        getNode: (id: string) => hierarchy[1].get(id),
      },
      expansionState: {
        expanded: [],
        setExpanded,
        handleToggleExpand: jest.fn(),
      },
      activeNodesState: { activeNodeIds: [], setActiveNodeIds },
    };

    return (
      <TreeLayoutProvider>
        <OrgChartDataSourceContext.Provider value={dataSource as DataSource}>
          {children}
          <TreeLayout
            {...treeLayoutStaticProps}
            rootNodes={hierarchy[0] as any}
            nodeTypes={nodeTypes}
            mode="compact"
          />
        </OrgChartDataSourceContext.Provider>
      </TreeLayoutProvider>
    );
  };
};

describe('useViewportActions', () => {
  describe('fitNodes', () => {
    it('should calculate and set viewport for given nodes', async () => {
      const { result } = renderHookWithProvider();

      const viewport = await waitFor(async () =>
        result.current.fitNodes(['3']),
      );

      expect(viewport).toEqual({
        x: 241,
        y: 153,
        zoom: 1,
      });
    });

    it('should respect options for animation and zoom', async () => {
      const { result } = renderHookWithProvider();

      await act(async () =>
        result.current.fitNodes(['1'], {
          animate: false,
          allowZoomIn: false,
        }),
      );
    });
  });

  describe('fitNodeBranch', () => {
    it('should expand ancestors and set active nodes', async () => {
      const { result } = renderHookWithProvider();
      const hierarchy = stratify(expandedData);

      const viewport = await waitFor(async () =>
        result.current.fitNodeBranch(hierarchy[1].get('1')!),
      );
      expect(setExpanded).toHaveBeenCalledWith(['1', '0']);
      expect(setActiveNodeIds).toHaveBeenCalledWith(['1', '0']);

      expect(viewport).toEqual({
        x: 259,
        y: 104.5,
        zoom: 1,
      });
    });

    it('should include direct ancestors when specified in options', async () => {
      const { result } = renderHookWithProvider();
      const hierarchy = stratify(expandedData);

      await act(async () =>
        result.current.fitNodeBranch(hierarchy[1].get('1')!, {
          includeDirectAncestors: true,
        }),
      );
    });
  });

  describe('findAndFocusOnNodeBranch', () => {
    it('should show error toast when node not found', async () => {
      const { result } = renderHookWithProvider();

      const viewport = await act(async () =>
        result.current.findAndFocusOnNodeBranch('nonexistent'),
      );

      expect(viewport).toBeNull();
      expect(notifySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
        }),
      );
    });

    it('should fit node branch when node is found', async () => {
      const { result } = renderHookWithProvider();

      const viewport = await waitFor(async () =>
        result.current.findAndFocusOnNodeBranch('1'),
      );

      expect(viewport).toEqual({
        x: 0,
        y: 0,
        zoom: 1,
      });
    });
  });
});
