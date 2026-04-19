import { useState } from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { listEmploymentsByPersonIdsHandlers } from '@personio-web/employees-organizations-data-gofer/mocking';
import { getEmployeeListColumnsHandlers } from '@personio-web/employees-organizations-data-people-list/mocking';
import { getSearchEmployeesHandlers } from '@personio-web/employees-organizations-data-search-employees/mocking';
import {
  type HierarchicalNode,
  stratify,
  type UseHierarchicalDataReturnType,
} from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { server } from '@personio-web/mocks/server';

import {
  getTranslation,
  renderWithWrapper,
} from '../../../../test-setup/testHelpers';
import {
  type EntityNode,
  HierarchicalRelationshipType,
  NodeType,
} from '../../../types';
import {
  type OrgChartDataSourceContext,
  OrgChartDataSourceContext,
} from '../../../hooks';
import { TestIds } from '../../../utils';
import {
  ControlBarSpotlight,
  type ControlBaSpotlightProps,
} from './ControlBarSpotlight';

const { t: tDS } = getTranslation('design-system', { keyPrefix: 'action' });
const { t: tEO } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.control-bar.spotlight',
});

const mockNodes = [
  {
    id: '4', // Root
    entity_id: '4', // Root
    parent_id: null,
    type: NodeType.Person,
    data: {
      type: NodeType.Person,
    },
  },
  {
    id: '5',
    entity_id: '5',
    parent_id: '4',
    type: NodeType.Person,
    data: {
      type: NodeType.Person,
    },
  },
  {
    id: '6',
    entity_id: '6',
    parent_id: '4',
    type: NodeType.Person,
    data: {
      type: NodeType.Person,
    },
  },
];
const [, mockCompleteNodesMap] = stratify<EntityNode>(mockNodes);

const Wrapper = (props?: Partial<ControlBaSpotlightProps>) => {
  const [spotlight, setSpotlight] = useState('');
  const hierarchy: UseHierarchicalDataReturnType<EntityNode, undefined> = {
    getNode: (id: string) => mockCompleteNodesMap.get(id),
    nodes: [],
    rootNodes: [],
  };

  return (
    <OrgChartDataSourceContext.Provider
      value={
        {
          activeNodesState: {
            activeNodeIds: props?.activeNodeIds ?? [],
          },
        } as any
      }
    >
      <ControlBarSpotlight
        focusedEmployeeId=""
        spotlight={spotlight}
        setSpotlight={setSpotlight}
        hierarchy={hierarchy}
        spotlightVisibleRelationships={[]}
        setSpotlightVisibleRelationships={() => ({})}
        {...props}
      />
    </OrgChartDataSourceContext.Provider>
  );
};

const renderTestComponent = (props?: Partial<ControlBaSpotlightProps>) =>
  renderWithWrapper(<Wrapper {...props} />);

const spotlightPerson = 'Peter - 4';

describe('<ControlBarSpotlight />', () => {
  beforeEach(() => {
    server.use(getEmployeeListColumnsHandlers.defaultHandler);
    server.use(getSearchEmployeesHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
  });

  it('should automatically spotlight focused person and not render the menu', () => {
    const mockSetSpotlight = jest.fn();
    renderTestComponent({
      focusedEmployeeId: '1',
      spotlight: undefined,
      setSpotlight: mockSetSpotlight,
    });

    expect(mockSetSpotlight).toHaveBeenCalledWith('1', 'control-bar-menu');
    expect(screen.queryByText(tEO('title'))).not.toBeInTheDocument();
  });

  it('renders ControlBarSpotlight', () => {
    renderTestComponent();

    expect(screen.getByText(tEO('title'))).toBeInTheDocument();
    expect(screen.getByText(tEO('sub-title'))).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(tEO('search-placeholder')),
    ).toBeInTheDocument();
    expect(screen.getByText(tEO('customize.title'))).toBeInTheDocument();
    expect(screen.getByText(tEO('customize.subtitle'))).toBeInTheDocument();
  });

  describe('People options', () => {
    it('searches and selects an item', async () => {
      const mockSetSpotlight = jest.fn();
      renderTestComponent({ setSpotlight: mockSetSpotlight });

      const searchInput = screen.getByPlaceholderText(
        tEO('search-placeholder'),
      );
      userEvent.type(searchInput, spotlightPerson);

      await waitFor(() =>
        expect(
          screen.queryByRole('option', { name: spotlightPerson }),
        ).toBeInTheDocument(),
      );

      const option = screen.getByRole('option', { name: spotlightPerson });
      userEvent.click(option);

      await waitFor(() =>
        expect(screen.getByText(spotlightPerson)).toBeInTheDocument(),
      );
      expect(mockSetSpotlight).toHaveBeenCalledWith('4');
    });

    it('clears the selected item', async () => {
      renderTestComponent();

      const searchInput = screen.getByPlaceholderText(
        tEO('search-placeholder'),
      );
      userEvent.type(searchInput, spotlightPerson);

      await waitFor(() =>
        expect(
          screen.queryByRole('option', { name: spotlightPerson }),
        ).toBeInTheDocument(),
      );

      const option = screen.getByRole('option', { name: spotlightPerson });
      userEvent.click(option);

      await waitFor(() =>
        expect(screen.getByText(spotlightPerson)).toBeInTheDocument(),
      );

      const clearButton = screen.getByRole('button', {
        name: tDS('clear-all'),
      });
      userEvent.click(clearButton);

      await waitFor(() =>
        expect(screen.queryByText(spotlightPerson)).not.toBeInTheDocument(),
      );
    });

    it('displays results based on hierarchy nodes', async () => {
      const mockHierarchy: UseHierarchicalDataReturnType<
        EntityNode,
        undefined
      > = {
        getNode: (id: string) => mockCompleteNodesMap.get(id),
        nodes: mockNodes as unknown as HierarchicalNode<
          EntityNode,
          undefined
        >[],
        rootNodes: [],
      };

      renderTestComponent({ hierarchy: mockHierarchy });

      expect(screen.getByText(tEO('title'))).toBeInTheDocument();
      expect(screen.getByText(tEO('sub-title'))).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(tEO('search-placeholder')),
      ).toBeInTheDocument();

      userEvent.click(screen.getByPlaceholderText(tEO('search-placeholder')));

      await waitFor(() =>
        expect(screen.getByText('Peter - 4')).toBeInTheDocument(),
      );
    });

    it('displays no results when search term does not match', async () => {
      renderTestComponent();

      const searchInput = screen.getByPlaceholderText(
        tEO('search-placeholder'),
      );
      userEvent.type(searchInput, 'Nonexistent Person');

      const spotlightPeoplePicker = screen.getByTestId(
        `${TestIds.SpotlightPeoplePicker}-content`,
      );
      await waitFor(() =>
        expect(
          within(spotlightPeoplePicker).queryByRole('option'),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('Relationship options', () => {
    it('should list basic relationship options', async () => {
      renderTestComponent();

      expect(
        screen.getByRole('option', { name: tEO('customize.supervisor') }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: tEO('customize.report') }),
      ).toBeInTheDocument();
    });

    it('options should be disabled if there is not spotlight person selected', async () => {
      renderTestComponent();

      expect(
        screen.getByRole('option', { name: tEO('customize.supervisor') }),
      ).toHaveAttribute('aria-disabled', 'true');
      expect(
        screen.getByRole('option', { name: tEO('customize.report') }),
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('options should be selected by default', async () => {
      renderTestComponent({ spotlight: '4' });

      expect(
        screen.getByRole('option', { name: tEO('customize.supervisor') }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(
        screen.getByRole('option', { name: tEO('customize.report') }),
      ).toHaveAttribute('aria-selected', 'true');
    });

    it('options should be selected depending on prop', async () => {
      renderTestComponent({
        spotlight: '4',
        spotlightVisibleRelationships: [
          HierarchicalRelationshipType.Supervisor,
        ],
      });

      expect(
        screen.getByRole('option', { name: tEO('customize.supervisor') }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(
        screen.getByRole('option', { name: tEO('customize.report') }),
      ).toHaveAttribute('aria-selected', 'false');
    });

    it('should emit set spotlight visible relationships on option select', async () => {
      const mockSetSpotlightVisibleRelationships = jest.fn();
      renderTestComponent({
        spotlight: '4',
        setSpotlightVisibleRelationships: mockSetSpotlightVisibleRelationships,
      });

      userEvent.click(
        screen.getByRole('option', { name: tEO('customize.report') }),
      );

      expect(mockSetSpotlightVisibleRelationships).toHaveBeenCalledWith([
        HierarchicalRelationshipType.Supervisor,
      ]);
    });

    it('should list additional relationship options', async () => {
      renderTestComponent({
        spotlight: '4',
        additionalSupervisorAttributes: {
          'additional-1': 'Project manager',
          'additional-2': 'Shift manager',
        },
      });

      const expandToggles = screen.getAllByTestId(
        `${TestIds.SpotlightRelationshipsPicker}-expand-toggle-interactive-icon`,
      );
      userEvent.click(expandToggles[0]);
      userEvent.click(expandToggles[1]);

      expect(
        screen.getByRole('option', { name: tEO('customize.all-supervisors') }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: tEO('customize.supervisor') }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: tEO('customize.all-supervisors') }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: tEO('customize.report') }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('option', { name: 'Project manager' }),
      ).toHaveLength(2);
      expect(
        screen.getAllByRole('option', { name: 'Shift manager' }),
      ).toHaveLength(2);
    });
  });
});
