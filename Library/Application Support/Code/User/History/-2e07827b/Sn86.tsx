import { waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';

import {
  getEmployeeHierarchyHandlers,
  listEmploymentsByPersonIdsHandlers,
  listPositionIdsHandlers,
} from '@personio-web/employees-organizations-data-gofer/mocking';
import { getSearchEmployeesHandlers } from '@personio-web/employees-organizations-data-search-employees/src/handlers';
import { listFilteredEmploymentIdsHandlers } from '@personio-web/employees-organizations-data-gofer/mocking';
import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/src/handlers';
import { getEmployeeListColumnsHandlers } from '@personio-web/employees-organizations-data-people-list/mocking';

import { renderHookWithWrapper } from '../../test-setup/testHelpers';

import { PersonCardDataLoaderProvider } from './usePersonCardDataLoader';
import {
  OrgChartDataSourceContextProvider,
  useOrgChartDataSourceContext,
} from './useOrgChartDataSourceContext';

import { type OrgChartPreferences, FilterCondition, NodeType } from '../types';
import {
  initialAttributes,
  personFilterableAttribute,
  FeatureFlags,
} from '../constants';

jest.mock('next/router', () => require('next-router-mock'));

const mockPreferences: OrgChartPreferences = {
  filters: [],
  searchTerm: '',
  spotlight: '',
  spotlightVisibleRelationships: [],
  cardPreferences: {
    personalInfo: true,
    avatars: true,
    cardClustering: true,
    openPositions: false,
  },
  attributes: initialAttributes,
  highlighted: '',
  sortByAttribute: false,
} as unknown as OrgChartPreferences;

const renderHookWithProvider = (prefs: Partial<OrgChartPreferences> = {}) => {
  const Provider = ({ children }: React.PropsWithChildren) => (
    <PersonCardDataLoaderProvider>
      <OrgChartDataSourceContextProvider
        preferences={{ ...mockPreferences, ...prefs }}
      >
        {children}
      </OrgChartDataSourceContextProvider>
    </PersonCardDataLoaderProvider>
  );
  return renderHookWithWrapper(() => useOrgChartDataSourceContext(), {
    innerWrapper: Provider,
  });
};

describe('useOrgChartDataSourceContext', () => {
  beforeEach(() => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
  });

  it('should compute and return the right set of information', async () => {
    const { result } = renderHookWithProvider();

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.hasFetchErrors).toBeNull();
    expect(result.current.displayableHierarchy).toBeDefined();
    expect(result.current.completeHierarchyData).toBeDefined();
    expect(result.current.filteredHierarchy).toBeDefined();
    expect(result.current.isFiltering).toBe(false);
    expect(result.current.groups).toBeUndefined();
    expect(result.current.spotlightedPerson).toBeDefined();
    expect(result.current.personSearch).toBeDefined();
    expect(result.current.expansionState).toBeDefined();
    expect(result.current.activeNodesState).toBeDefined();
  });

  it('should update the search results when searchTerm is provided', async () => {
    server.use(getSearchEmployeesHandlers.defaultHandler);

    const { result } = renderHookWithProvider({ searchTerm: 'peter' });

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.personSearch.searchResults).toHaveLength(4);
  });

  describe('expansionState', () => {
    it('should set the expansioState to rootNodes by default', async () => {
      const { result } = renderHookWithProvider();

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      const rootNodeIds = result.current.displayableHierarchy.rootNodes.map(
        (node) => node.id,
      );
      expect(result.current.expansionState.expanded).toBe(rootNodeIds);
    });
  });

  describe('filtering', () => {
    it('should return empty hierarchy when filter has no matches', async () => {
      const { result } = renderHookWithProvider({
        filters: [
          { id: 'fil1', value: { value: 'val', condition: 'contains' } },
        ],
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();
      expect(result.current.displayableHierarchy).toEqual(
        expect.objectContaining({ nodes: [], rootNodes: [] }),
      );
    });

    it('should return hierarchy including the matched and unmatched nodes', async () => {
      server.use(listFilteredEmploymentIdsHandlers.defaultHandler);
      const { result } = renderHookWithProvider({
        filters: [
          {
            id: personFilterableAttribute.Department,
            value: {
              value: ['1', '2', '3'],
              condition: FilterCondition.Contains,
            },
          },
        ],
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();
      expect(result.current.displayableHierarchy.nodes).toHaveLength(279);
      expect(
        result.current.displayableHierarchy.nodes.filter(
          (n) => n.data.type === NodeType.Person,
        ),
      ).toHaveLength(249);
      expect(
        result.current.displayableHierarchy.nodes.filter(
          (n) => n.data.type === NodeType.UnmatchedPerson,
        ),
      ).toHaveLength(30);
    });
  });

  describe('Spotlight Functionality', () => {
    it('should limit the hierarchy to the spotlighted node and ignore other filters', async () => {
      const { result } = renderHookWithProvider({
        spotlight: '722',
        spotlightVisibleRelationships: ['-1'],
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();
      expect(result.current.displayableHierarchy).toBe(
        result.current.filteredHierarchy,
      );

      const spotlightedNode =
        result.current.displayableHierarchy.getNode('722');
      expect(spotlightedNode).toBeDefined();
      expect(result.current.displayableHierarchy.nodes.length).toBe(1);
      expect(spotlightedNode?.ancestors).toHaveLength(0);
      expect(spotlightedNode?.childrenCount).toBe(0);
    });

    it('should include ancestors when supervisor relationship is visible', async () => {
      const { result } = renderHookWithProvider({
        spotlight: '722',
        spotlightVisibleRelationships: ['supervisor'],
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();
      expect(result.current.displayableHierarchy).toBe(
        result.current.filteredHierarchy,
      );

      const spotlightedNode =
        result.current.displayableHierarchy.getNode('722');
      expect(spotlightedNode).toBeDefined();
      expect(result.current.displayableHierarchy.nodes.length).toBe(4);
      expect(spotlightedNode?.ancestors).toHaveLength(3);
      expect(spotlightedNode?.childrenCount).toBe(0);
    });

    it('should include descendants when report relationship is visible', async () => {
      const { result } = renderHookWithProvider({
        spotlight: '722',
        spotlightVisibleRelationships: ['report'],
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();
      expect(result.current.displayableHierarchy).toBe(
        result.current.filteredHierarchy,
      );

      const spotlightedNode =
        result.current.displayableHierarchy.getNode('722');
      expect(spotlightedNode).toBeDefined();
      expect(result.current.displayableHierarchy.nodes.length).toBe(3);
      expect(spotlightedNode?.ancestors).toHaveLength(0);
      expect(spotlightedNode?.childrenCount).toBe(2);
    });
  });

  describe('Open Positions', () => {
    beforeEach(() => {
      server.use(listPositionIdsHandlers.defaultHandler);
      server.use(
        getFeatureAccessHandlers.getFeatureAccess200Handler__getPositionsAuthorized,
      );
    });

    it('should include open positions when enabled without spotlight', async () => {
      const { result } = renderHookWithProvider({
        cardPreferences: {
          openPositions: true,
        } as any,
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.completeHierarchyData.openPositions).toBeDefined();
    });

    it('should include open positions under spotlight node when relevant', async () => {
      const { result } = renderHookWithProvider({
        spotlight: '66',
        cardPreferences: {
          openPositions: true,
        } as any,
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();

      const spotlightedNode = result.current.displayableHierarchy.getNode('66');
      expect(spotlightedNode).toBeDefined();
      expect(spotlightedNode?.children?.at(0)?.id).toBe('P0');
    });
  });

  describe('Additional Relationships', () => {
    beforeEach(() => {
      server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
      server.use(
        getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
      );
    });

    it('should handle additional supervisors and subordinates correctly', async () => {
      const { result } = renderHookWithProvider({
        spotlight: '1',
        spotlightVisibleRelationships: [
          'supervisor:dynamic_66c73d69337bb1.80940209',
          'report:dynamic_66c73d69337bb1.80940209',
          'supervisor:dynamic_66c73d69337bb1.80940210',
          'report:dynamic_66c73d69337bb1.80940210',
        ],
      });

      await waitFor(() => expect(result.current.isFetching).toBeFalse());
      expect(result.current.isFiltering).toBeTrue();
      expect(result.current.groups).toMatchObject({
        'dynamic_66c73d69337bb1.80940209': 'Project Manager',
        'dynamic_66c73d69337bb1.80940210': 'Shift Manager',
      });

      const rels = result.current.spotlightedPerson.additionalRelationships;
      expect(rels?.filter((rel) => rel.type === 'supervisor')).toHaveLength(8);
      expect(rels?.filter((rel) => rel.type === 'subordinate')).toHaveLength(6);

      const hierarchy = result.current.displayableHierarchy;
      expect(hierarchy.rootNodes).toHaveLength(9); // 8 supervisors + 1 hidden root
      expect(hierarchy.rootNodes.at(0)?.id).toBe('hidden-root');
      expect(hierarchy.rootNodes.at(1)?.id).toBe(
        'dynamic_66c73d69337bb1.80940209-601-supervisor',
      );

      const spotlightedNode = hierarchy.getNode('1');
      expect(spotlightedNode?.children).toHaveLength(6);
    });
  });
});
