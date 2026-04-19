import React, { useState } from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { listEmploymentsByPersonIdsHandlers } from '@personio-web/employees-organizations-data-gofer/mocking';
import { stratify } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { type HierarchicalNode } from '@personio-web/employees-organizations-hook-use-hierarchical-data-types';
import { server } from '@personio-web/mocks/server';

import {
  getTranslation,
  mockOrgChartPreferencesProps,
  renderWithWrapper,
} from '../../test-setup/testHelpers';
import * as Amp from '../constants/amplitude';
import {
  OrgChartPreferencesProvider,
  PersonCardDataLoaderProvider,
  useExpansionState,
} from '../hooks';
import * as hooks from '../hooks';
import { TreeLayoutProvider } from '../TreeLayout';
import { RelationshipType } from '../TreeLayout/types';
import { type EntityNode, NodeType } from '../types';
import { TestIds } from '../utils';
import { OrgChartTree } from './OrgChartTree';
import { type OrgChartTreeProps } from './types';

const mockOpenDialog = jest.fn();

jest.mock(
  '@personio-web/employees-organizations-hook-use-dialog-context',
  () => ({
    useDialogContext: () => ({
      openDialog: (...args: []) => mockOpenDialog(...args),
      isDialogOfType: () => jest.fn(),
      closeDialog: () => jest.fn(),
    }),
  }),
);
jest.mock('next/router', () => require('next-router-mock'));

const mockTrackAmplitudeEvent = jest.fn();

jest.mock('@personio-web/amplitude-provider', () => ({
  useAmplitude: () => ({
    track: mockTrackAmplitudeEvent,
  }),
}));

const useOrgChartDataSourceContextSpy = jest.spyOn(
  hooks,
  'useOrgChartDataSourceContext',
);

const [mockRootNodes, nodesMap] = stratify([
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
]);

const mockNodes = mockRootNodes.flatMap((node) => node.descendants);

describe('OrgChartTree', () => {
  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart',
  });

  const MockOrgChartTree = (props?: Partial<OrgChartTreeProps>) => {
    const [employeeId, setEmployeeId] = useState<string | null>(null);

    const expansionState = useExpansionState(
      mockRootNodes.map((node) => node.id),
    );
    const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
    const activeNodesState = { activeNodeIds, setActiveNodeIds };

    useOrgChartDataSourceContextSpy.mockReturnValue({
      isFetching: false,
      hasFetchErrors: false,
      isFiltering: false,
      displayableHierarchy: {
        rootNodes: mockRootNodes,
        nodes: mockNodes,
        getNode: (id: string) => nodesMap.get(id),
      },
      completeHierarchyData: {} as any,
      filteredHierarchy: {} as any,
      groups: {},
      spotlightedPerson: {} as any,
      personSearch: {} as any,
      expansionState,
      activeNodesState,
    });

    return (
      <TreeLayoutProvider>
        <PersonCardDataLoaderProvider attributeIds={[]}>
          <OrgChartPreferencesProvider {...mockOrgChartPreferencesProps}>
            <OrgChartTree
              rootNodes={mockRootNodes}
              nodes={mockNodes}
              getNode={(id: string) => nodesMap.get(id)}
              interactive={false} // Disables interactiveness for tests https://github.com/xyflow/xyflow/issues/2461#issuecomment-2163004273
              focusedEmployeeId={employeeId ?? undefined}
              setFocusedEmployeeId={setEmployeeId}
              hidePersonalInfo={false}
              hideAvatars={false}
              isFiltering={false}
              {...props}
            />
          </OrgChartPreferencesProvider>
        </PersonCardDataLoaderProvider>
      </TreeLayoutProvider>
    );
  };

  it('renders initial tree', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    renderWithWrapper(<MockOrgChartTree />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TestIds.PersonCard}-3`)).toBeInTheDocument();
  });

  it('should expand node', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    renderWithWrapper(<MockOrgChartTree />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId(`${TestIds.PersonCard}-1`));

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-4`)).toBeInTheDocument();
    });
  });

  it('should render view actions bar', async () => {
    renderWithWrapper(<MockOrgChartTree />);

    await waitFor(() => {
      expect(screen.getByTestId(TestIds.FloatingActionBar)).toBeInTheDocument();
    });
  });

  it('should reset to home view', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    renderWithWrapper(<MockOrgChartTree />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId(`${TestIds.PersonCard}-1`));

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-4`)).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', {
        name: t('view-actions-bar.tooltip.reset-to-home-view'),
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${TestIds.PersonCard}-4`),
      ).not.toBeInTheDocument();
    });

    expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.RESET_TO_HOME);
  });

  it('should focus on me', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    renderWithWrapper(<MockOrgChartTree />, {
      authClaim: {
        companyId: -1,
        employeeId: 4,
        entityType: 'employee',
        userId: '123',
        version: 3,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', {
        name: t('view-actions-bar.tooltip.focus-on-me'),
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-4`)).toBeInTheDocument();
    });

    expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.FOCUSED_ON_ME);
  });

  it('should open remove filters dialog if focus on me node is not visible', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    renderWithWrapper(<MockOrgChartTree />, {
      authClaim: {
        companyId: -1,
        employeeId: 456,
        entityType: 'employee',
        userId: '123',
        version: 3,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', {
        name: t('view-actions-bar.tooltip.focus-on-me'),
      }),
    );

    await waitFor(() => {
      expect(mockOpenDialog).toHaveBeenCalledWith('org-chart.remove-filters', {
        employeeId: '456',
      });
    });
  });

  it('should focus on spotlighted node', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    renderWithWrapper(<MockOrgChartTree spotlight="2" />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toHaveClass(
      'isFocused',
    );
  });

  it('should correctly calculate subordinates count when spotlighted', async () => {
    const spotlightId = '0';
    const [localMockRootNodes, localNodesMap] = stratify([
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
        group: { relationshipType: RelationshipType.Child },
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
    ]);

    renderWithWrapper(
      <MockOrgChartTree
        spotlight={spotlightId}
        rootNodes={localMockRootNodes as HierarchicalNode<EntityNode>[]}
        nodes={localMockRootNodes as HierarchicalNode<EntityNode>[]}
        getNode={(id: string) =>
          localNodesMap.get(id) as HierarchicalNode<EntityNode> | undefined
        }
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    const rootNode = screen.getByTestId(`${TestIds.PersonCard}-0`);

    expect(rootNode).toHaveTextContent('2');
  });

  it('should show correct counter when is filtering and there are unmatched person cards', async () => {
    const [localMockRootNodes, localNodesMap] = stratify([
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
        parent_id: '1',
        type: NodeType.Person,
      },
      {
        id: '4',
        entity_id: '4',
        parent_id: '1',
        type: NodeType.UnmatchedPerson,
      },
      {
        id: '5',
        entity_id: '5',
        parent_id: '3',
        type: NodeType.UnmatchedPerson,
      },
      {
        id: '6',
        entity_id: '6',
        parent_id: '5',
        type: NodeType.Person,
      },
    ]);

    renderWithWrapper(
      <MockOrgChartTree
        spotlight="6"
        rootNodes={localMockRootNodes as HierarchicalNode<EntityNode>[]}
        nodes={localMockRootNodes as HierarchicalNode<EntityNode>[]}
        getNode={(id: string) =>
          localNodesMap.get(id) as HierarchicalNode<EntityNode> | undefined
        }
        isFiltering={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });

    const card = screen.getByTestId(`${TestIds.PersonCard}-0`);
    expect(card).toHaveTextContent('2 (4)');
  });

  it('should show all nodes when filtering', async () => {
    const [localMockRootNodes, localNodesMap] = stratify([
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
        parent_id: '1',
        type: NodeType.Person,
      },
      {
        id: '4',
        entity_id: '4',
        parent_id: '1',
        type: NodeType.UnmatchedPerson,
      },
      {
        id: '5',
        entity_id: '5',
        parent_id: '3',
        type: NodeType.UnmatchedPerson,
      },
      {
        id: '6',
        entity_id: '6',
        parent_id: '5',
        type: NodeType.Person,
      },
    ]);

    const mockNodes = localMockRootNodes.flatMap((node) => node.descendants);

    renderWithWrapper(
      <MockOrgChartTree
        rootNodes={localMockRootNodes as HierarchicalNode<EntityNode>[]}
        nodes={mockNodes}
        getNode={(id: string) =>
          localNodesMap.get(id) as HierarchicalNode<EntityNode> | undefined
        }
        isFiltering={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-0`)).toBeInTheDocument();
    });
    expect(screen.getByTestId(`${TestIds.PersonCard}-5`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TestIds.PersonCard}-6`)).toBeInTheDocument();
  });
});
