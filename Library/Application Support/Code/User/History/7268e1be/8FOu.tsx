import { useEffect, useState } from 'react';

import { waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { type EntityNode } from '@personio-web/employees-organizations-feature-org-chart';
import {
  type UseHierarchicalDataReturnType,
  stratify,
} from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { toaster } from 'designSystem/component/toaster';

import { renderHookWithWrapper } from '../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartDataSourceContext } from '../../test-setup/mocks/MockOrgChartDataSourceContext';
import { MockOrgChartUIContext } from '../../test-setup/mocks/MockOrgChartUIContext';
import { LayoutProvider } from '../layout';
import { NodeMap } from '../Nodes/constants';
import { nodeTypes } from '../OrgChartTree/constants';
import { TreeLayoutProvider, TreeLayout } from '../TreeLayout';
import { extendHierarchicalTreeNode } from '../TreeLayout/hooks';
import { computeTreeCoordinates } from '../sources/layouts/tree';
import { useViewportActions } from '.';

const initialData: EntityNode[] = [
  {
    id: '0', // Root
    entity_id: '0', // Root
    parent_id: null,
    type: 'person',
  },
];
const expandedData: EntityNode[] = [
  {
    id: '0', // Root
    entity_id: '0', // Root
    parent_id: null,
    type: NodeMap.Person,
  },
  {
    id: '1',
    entity_id: '1',
    parent_id: '0',
    type: NodeMap.Person,
  },
  {
    id: '2',
    entity_id: '2',
    parent_id: '0',
    type: NodeMap.Person,
  },
  {
    id: '3',
    entity_id: '3',
    parent_id: '0',
    type: NodeMap.Person,
  },
  {
    id: '4',
    entity_id: '4',
    parent_id: '1',
    type: NodeMap.Person,
  },
];

const notifySpy = jest.spyOn(toaster, 'notify');

type Hierarchy = ReturnType<typeof stratify<EntityNode>>;
type DataSource = Parameters<typeof MockOrgChartDataSourceContext>[0];

const setExpanded = jest.fn();
const setActiveCardId = jest.fn();

const renderHookWithProvider = (props?: Partial<DataSource>) => {
  const Provider = ({ children }: React.PropsWithChildren) => {
    const initialHierarchy: Hierarchy = stratify(
      initialData,
      undefined,
      extendHierarchicalTreeNode as never,
    );
    const [hierarchy, setHierarchy] = useState<Hierarchy>(initialHierarchy);

    // Simulate expansion / update of the chart nodes
    useEffect(() => {
      const newHierarchy = stratify(
        expandedData,
        undefined,
        extendHierarchicalTreeNode as never,
      );
      setTimeout(() => setHierarchy(newHierarchy), 0);
    }, []);

    const completeHierarchy: UseHierarchicalDataReturnType<EntityNode> = {
      rootNodes: hierarchy[0],
      nodes: hierarchy[0].flatMap((node) => Array.from(node)),
      getNode: (id: string) => hierarchy[1].get(id),
    };

    const rootNodes = computeTreeCoordinates(
      completeHierarchy.rootNodes as never,
      { nodeSize: { width: 1, height: 1 } },
    );

    const dataSource: Partial<DataSource> = {
      completeHierarchyData: {
        data: {
          hierarchy: props?.displayableHierarchy ?? completeHierarchy,
          includedRootIds: [],
        },
      } as any,
      displayableHierarchy: props?.displayableHierarchy ?? completeHierarchy,
      visibleChartData: {
        rootNodes: rootNodes as never,
        nodes: rootNodes.flatMap((node) => node.descendants) as never,
        groupNodes: [],
        edges: [],
        nodeSize: { width: 1, height: 1 },
        translateExtent: [
          [0, 0],
          [0, 0],
        ],
      },
    };

    return (
      <LayoutProvider>
        <TreeLayoutProvider>
          <MockOrgChartPreferencesContext
            // @ts-expect-error - enough for testing
            expansionState={{ expanded: [], setExpanded }}
            setActiveCardId={setActiveCardId}
          >
            <MockOrgChartDataSourceContext {...dataSource}>
              <MockOrgChartUIContext>
                {children}
                <TreeLayout nodeTypes={nodeTypes} />
              </MockOrgChartUIContext>
            </MockOrgChartDataSourceContext>
          </MockOrgChartPreferencesContext>
        </TreeLayoutProvider>
      </LayoutProvider>
    );
  };

  return renderHookWithWrapper(() => useViewportActions(), {
    innerWrapper: Provider,
  });
};

describe('useViewportActions', () => {
  describe('fitNodes', () => {
    it('should calculate and set viewport for given nodes', async () => {
      const { result } = renderHookWithProvider();

      const viewport = await waitFor(async () =>
        result.current.fitNodes(['3']),
      );

      expect(viewport).toEqual({
        x: 248,
        y: 247,
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

    it('should respect option for optional centering', async () => {
      const { result } = renderHookWithProvider();

      const viewport = await waitFor(async () =>
        result.current.fitNodes(['3'], { optionalCentering: true }),
      );

      expect(viewport).toEqual({
        x: 55.69230769230771,
        y: 54.69230769230771,
        zoom: 1,
      });
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
      expect(setActiveCardId).toHaveBeenCalledWith('1', ['1', '0']);

      expect(viewport).toEqual({
        x: 252,
        y: 245.5,
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
      const completeHierarchy = stratify(expandedData);
      const completeNodes = completeHierarchy[0].flatMap((items) =>
        Array.from(items),
      );

      const { result } = renderHookWithProvider({
        displayableHierarchy: {
          rootNodes: completeHierarchy[0],
          nodes: completeNodes,
          getNode: (id: string) => completeHierarchy[1].get(id),
        },
      });

      const viewport = await waitFor(async () =>
        result.current.findAndFocusOnNodeBranch('1'),
      );

      expect(viewport).toEqual({
        x: 252,
        y: 245.5,
        zoom: 1,
      });
    });
  });
});
