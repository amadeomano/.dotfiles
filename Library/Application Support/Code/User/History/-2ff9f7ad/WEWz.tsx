import React from 'react';

import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/mocking';
import {
  getEmployeeHierarchyHandlers,
  listEmploymentsByPersonIdsHandlers,
  listFilteredEmploymentIdsHandlers,
  listPositionIdsHandlers,
  listPositionsDataHandlers,
} from '@personio-web/employees-organizations-data-gofer/mocking';
import {
  getEmployeeListColumnsHandlers,
  getEmployeeListMetadataHandlers,
} from '@personio-web/employees-organizations-data-people-list/mocking';
import { getSearchEmployeesHandlers } from '@personio-web/employees-organizations-data-search-employees/mocking';
import {
  generateOrgChartLink,
  ORG_CHART_URL_BASE,
} from '@personio-web/employees-organizations-util-org-chart';
import { server } from '@personio-web/mocks/server';

import { getTranslation, renderWithWrapper } from '../test-setup/testHelpers';
import { personFilterableAttribute, SEARCH_DEBOUNCE_TIME } from './constants';
import { OrgChart } from './OrgChart';
import { FilterCondition, NodeType } from './types';
import { TestIds } from './utils';
import { TestID } from 'react-querybuilder';

const mockOpenDialog = jest.fn();

const mockUseDialogContext = jest.fn().mockImplementation(() => ({
  closeDialog: jest.fn(),
  isDialogOfType: jest.fn(),
  dialogState: {},
  openDialog: (...args: unknown[]) => mockOpenDialog(...args),
}));

jest.mock(
  '@personio-web/employees-organizations-hook-use-dialog-context',
  () => ({
    useDialogContext: () => mockUseDialogContext(),
  }),
);

jest.mock('./hooks/useViewportActions', () => ({
  useViewportActions: () => ({
    findAndFocusOnNodeBranch: jest.fn(),
  }),
}));

describe('OrgChartFeature', () => {
  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar',
  });
  const { t: tDS } = getTranslation('design-system', {
    keyPrefix: 'control-bar',
  });
  beforeAll(() => {
    server.use(getEmployeeListColumnsHandlers.defaultHandler);
    server.use(getSearchEmployeesHandlers.defaultHandler);
    server.use(getEmployeeListMetadataHandlers.defaultHandler);
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  it('renders error state when hierarchy query fails', async () => {
    server.use(getEmployeeHierarchyHandlers.errorHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.ErrorState}`)).toBeInTheDocument();
    });
  });

  it('renders error state when filter query fails', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listFilteredEmploymentIdsHandlers.errorHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          filters: generateOrgChartLink({
            filters: [
              {
                id: personFilterableAttribute.Department,
                value: {
                  value: ['1', '2', '3'],
                  condition: FilterCondition.Contains,
                },
              },
            ],
          }).replace(`${ORG_CHART_URL_BASE}?filters=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.ErrorState}`)).toBeInTheDocument();
    });
  });

  it('renders non-filtered initial tree', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.Person}`),
      ).toHaveLength(10);
    });
  });

  it('renders filtered initial tree', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listFilteredEmploymentIdsHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          filters: generateOrgChartLink({
            filters: [
              {
                id: personFilterableAttribute.Department,
                value: {
                  value: ['1', '2', '3'],
                  condition: FilterCondition.Contains,
                },
              },
            ],
          }).replace(`${ORG_CHART_URL_BASE}?filters=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.Person}`),
      ).toHaveLength(249);
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.UnmatchedPerson}`),
      ).toHaveLength(30);
    });

    // Expect order to be maintained
    const node2 = screen.getByTestId(`${TestIds.PersonCard}-2`);
    const node3 = screen.getByTestId(`${TestIds.PersonCard}-3`);
    expect(node2).toBeInTheDocument();
    expect(node3).toBeInTheDocument();
    expect(node2.compareDocumentPosition(node3)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('renders non-filtered tree with positions', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getPositionsAuthorized,
    );
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(listPositionIdsHandlers.defaultHandler);
    server.use(listPositionsDataHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          cardCustomizationPreferences: generateOrgChartLink({
            cardCustomizationPreferences: {
              openPositions: true,
              personalInfo: true,
              avatars: true,
              cardClustering: true,
            },
          }).replace(`${ORG_CHART_URL_BASE}?cardCustomizationPreferences=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.Position}`),
      ).toBeTruthy();
    });
  });

  it('focus on node when searched employee is selected', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(getSearchEmployeesHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', { name: t('search.placeholder') }),
    );

    const searchInput = screen.getByPlaceholderText<HTMLInputElement>(
      t('search.label'),
    );
    userEvent.type(searchInput, 'search-term');
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_TIME);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    userEvent.click(screen.getAllByRole('option')[3]); // Peter 16

    await waitFor(() => {
      expect(
        screen.getByTestId(`${TestIds.PersonCard}-16`),
      ).toBeInTheDocument();
    });
  });

  it('open reset filters dialog on node when searched employee is filtered out', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listFilteredEmploymentIdsHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(getSearchEmployeesHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          filters: generateOrgChartLink({
            filters: [
              {
                id: personFilterableAttribute.Department,
                value: {
                  value: ['1', '2', '3'],
                  condition: FilterCondition.Contains,
                },
              },
            ],
          }).replace(`${ORG_CHART_URL_BASE}?filters=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', { name: t('search.placeholder') }),
    );

    const searchInput = screen.getByPlaceholderText<HTMLInputElement>(
      t('search.label'),
    );

    userEvent.type(searchInput, 'search-term');

    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_TIME);
    });

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    userEvent.click(screen.getAllByRole('option')[3]); // Peter 4

    await waitFor(() => {
      expect(mockOpenDialog).toHaveBeenCalledWith('org-chart.remove-filters', {
        employeeId: '4',
      });
    });
  });

  it('renders loading tree when hierarchy query is loading', async () => {
    server.use(getEmployeeHierarchyHandlers.loadingHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.Loading}`),
      ).toBeTruthy();
    });
  });

  it('renders loading tree when filter query is loading', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listFilteredEmploymentIdsHandlers.loadingHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          filters: generateOrgChartLink({
            filters: [
              {
                id: personFilterableAttribute.Department,
                value: {
                  value: ['1', '2', '3'],
                  condition: FilterCondition.Contains,
                },
              },
            ],
          }).replace(`${ORG_CHART_URL_BASE}?filters=`, ''),
        },
      },
    });

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.Loading}`),
      ).toBeTruthy();
    });
  });

  it('renders empty state when hierarchy query returns no data', async () => {
    server.use(getEmployeeHierarchyHandlers.emptyHandler);
    server.use(listFilteredEmploymentIdsHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TestIds.EmptyStateWithoutNodes),
      ).toBeInTheDocument();
    });
  });

  it('renders empty state when employment ids are empty', async () => {
    server.use(getEmployeeHierarchyHandlers.withoutRootNodeHandler);
    server.use(listFilteredEmploymentIdsHandlers.emptyHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(
        screen.getByTestId(TestIds.EmptyStateWithHangingNodes),
      ).toBeInTheDocument();
    });
  });

  it('renders error state when filter query returns no data', async () => {
    server.use(getEmployeeHierarchyHandlers.withoutExtraRootNodeHandler);
    server.use(listFilteredEmploymentIdsHandlers.emptyHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          filters: generateOrgChartLink({
            filters: [
              {
                id: personFilterableAttribute.Department,
                value: {
                  value: ['1', '2', '3'],
                  condition: FilterCondition.Contains,
                },
              },
            ],
          }).replace(`${ORG_CHART_URL_BASE}?filters=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(TestIds.EmptyStateWithoutNodes),
      ).toBeInTheDocument();
    });
  });

  it('spotlights an employee, cleans filter state and disable filter menu', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[0],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${TestIds.ControlBarSpotlight}-popover-trigger`),
      ).toHaveTextContent(`${t('spotlight.title')}: Peter - 1`);
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: tDS('trigger.filter') }),
      ).toBeDisabled();
    });
  });

  it('renders only open positions which the target supervisor is the spotlighted person', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getPositionsAuthorized,
    );
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(listPositionIdsHandlers.defaultHandler);
    server.use(listPositionsDataHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          cardCustomizationPreferences: generateOrgChartLink({
            cardCustomizationPreferences: {
              openPositions: true,
              personalInfo: true,
              avatars: true,
              cardClustering: true,
            },
          }).replace(`${ORG_CHART_URL_BASE}?cardCustomizationPreferences=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[0],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId(`${TestIds.Node}-${NodeType.Position}`),
      ).toHaveLength(1);
    });

    expect(
      screen.getByTestId(`${TestIds.PositionCard}-P4`),
    ).toBeInTheDocument();

    // The node 2001 in the target supervisor of an open position,
    // but it not in the spotlighted hierarchy, so it should be hidden
    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-2001`),
    ).not.toBeInTheDocument();
  });

  it('spotlights an employee and displays additional supervisors and subordinates', async () => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
    );

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[0],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    const additionalSupervisorAttributeId = 'dynamic_66c73d69337bb1.80940209';
    const additionalSupervisorAttributeLabel = 'Project Manager';

    await waitFor(() => {
      expect(
        screen.getByTestId(
          `${TestIds.Node}-${NodeType.Group}-${additionalSupervisorAttributeId}-1`,
        ),
      ).toHaveTextContent(additionalSupervisorAttributeLabel);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(
          `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-601-supervisor`,
        ),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-301-subordinate`,
      ),
    ).toBeInTheDocument();
  });

  it('spotlights an root node with displays additional supervisors correctly', async () => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
    );

    const { container } = renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[0],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    const additionalSupervisorAttributeId = 'dynamic_66c73d69337bb1.80940209';

    await waitFor(() => {
      expect(
        screen.getByTestId(
          `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-601-supervisor`,
        ),
      ).toBeInTheDocument();
    });

    const supervisorTransform = (
      container.querySelector(
        `[data-testid="rf__node-${additionalSupervisorAttributeId}-601-supervisor"]`,
      ) as HTMLElement
    )?.style.transform;

    const rootNodeTransform = (
      container.querySelector(`[data-testid="rf__node-1"]`) as HTMLElement
    )?.style.transform;

    const translateRegex =
      /translate\((-?\d+(?:\.\d*)?)px,(-?\d+(?:\.\d*)?)px\)/;
    const additionalSupervisorNodeX = parseFloat(
      supervisorTransform.match(translateRegex)?.[2] ?? '0',
    );
    const rootNodeX = parseFloat(
      rootNodeTransform.match(translateRegex)?.[2] ?? '0',
    );

    expect(additionalSupervisorNodeX).toBeLessThan(rootNodeX);
  });

  it('should conditionally hide supervisors depending on spotlight customization options', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[1],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    // Unchecks supervisors
    userEvent.click(
      screen.getByRole('option', { name: t('spotlight.customize.supervisor') }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    // Supervisor is hidden
    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-1`),
    ).not.toBeInTheDocument();

    // Report is visible
    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-71`),
    ).toBeInTheDocument();
  });

  it('should conditionally hide subordinate depending on spotlight customization options', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[1],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    // Unchecks reports
    userEvent.click(
      screen.getByRole('option', { name: t('spotlight.customize.report') }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    // Supervisor is visible
    expect(screen.queryByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();

    // Report is hidden
    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-71`),
    ).not.toBeInTheDocument();
  });

  it('should conditionally hide additional supervisor group depending on spotlight customization options', async () => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
    );

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[1],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    const additionalSupervisorAttributeId = 'dynamic_66c73d69337bb1.80940209';
    const additionalSupervisorAttributeLabel = 'Project Manager';

    // Unchecks additional supervisor visibility
    userEvent.click(
      screen.getAllByTestId(
        `${TestIds.SpotlightRelationshipsPicker}-expand-toggle-interactive-icon`,
      )[0],
    );
    userEvent.click(
      screen.getByRole('option', { name: additionalSupervisorAttributeLabel }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    // Additional supervisor group is hidden
    expect(
      screen.queryByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-601-supervisor`,
      ),
    ).not.toBeInTheDocument();

    // Additional report group is visible
    expect(
      screen.getByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-301-subordinate`,
      ),
    ).toBeInTheDocument();
  });

  it('should conditionally hide additional reports group depending on spotlight customization options', async () => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
    );

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[1],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    const additionalSupervisorAttributeId = 'dynamic_66c73d69337bb1.80940209';
    const additionalSupervisorAttributeLabel = 'Project Manager';

    // Unchecks additional reports visibility
    userEvent.click(
      screen.getAllByTestId(
        `${TestIds.SpotlightRelationshipsPicker}-expand-toggle-interactive-icon`,
      )[1],
    );
    userEvent.click(
      screen.getByRole('option', { name: additionalSupervisorAttributeLabel }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    // Additional supervisor group is visible
    expect(
      screen.getByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-601-supervisor`,
      ),
    ).toBeInTheDocument();

    // Additional report group is hidden
    expect(
      screen.queryByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-301-subordinate`,
      ),
    ).not.toBeInTheDocument();
  });

  it('should conditionally hide all supervisors depending on spotlight customization options', async () => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
    );

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[1],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    const additionalSupervisorAttributeId = 'dynamic_66c73d69337bb1.80940209';

    // Unchecks all supervisors
    userEvent.click(
      screen.getByRole('option', {
        name: t('spotlight.customize.all-supervisors'),
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    // Supervisor is hidden
    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-1`),
    ).not.toBeInTheDocument();

    // Additional supervisor group is hidden
    expect(
      screen.queryByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-601-supervisor`,
      ),
    ).not.toBeInTheDocument();

    // Report is visible
    await waitFor(() =>
      expect(
        screen.queryByTestId(`${TestIds.PersonCard}-71`),
      ).toBeInTheDocument(),
    );

    // Additional report group is visible
    expect(
      screen.queryByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-301-subordinate`,
      ),
    ).toBeInTheDocument();
  });

  it('should conditionally hide all reports depending on spotlight customization options', async () => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__withEnrichedEmployeeInfoAttributes,
    );

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    });
    userEvent.click(screen.getByText(t('spotlight.title')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    userEvent.click(screen.getByRole('combobox'));

    const spotlightPeoplePicker = screen.getByTestId(
      `${TestIds.SpotlightPeoplePicker}-content`,
    );
    await waitFor(() => {
      expect(within(spotlightPeoplePicker).getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(
      within(spotlightPeoplePicker).getAllByRole('option')[1],
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    const additionalSupervisorAttributeId = 'dynamic_66c73d69337bb1.80940209';

    // Unchecks all reports
    userEvent.click(
      screen.getByRole('option', {
        name: t('spotlight.customize.all-reports'),
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    // Supervisor is visible
    expect(screen.queryByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();

    // Additional supervisor group is visible
    expect(
      screen.getByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-601-supervisor`,
      ),
    ).toBeInTheDocument();

    // Report is hidden
    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-71`),
    ).not.toBeInTheDocument();

    // Additional report group is hidden
    expect(
      screen.queryByTestId(
        `${TestIds.PersonCard}-${additionalSupervisorAttributeId}-301-subordinate`,
      ),
    ).not.toBeInTheDocument();
  });

  it('focus on node when searched employee is selected while spotlight is enabled', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(getSearchEmployeesHandlers.defaultHandler);

    renderWithWrapper(<OrgChart />);

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-1`)).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', { name: t('search.placeholder') }),
    );

    const searchInput = screen.getByPlaceholderText<HTMLInputElement>(
      t('search.label'),
    );
    userEvent.type(searchInput, 'search-term');
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_TIME);

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    userEvent.click(screen.getAllByRole('option')[3]); // Peter 16

    await waitFor(() => {
      expect(
        screen.getByTestId(`${TestIds.PersonCard}-16`),
      ).toBeInTheDocument();
    });
  });

  it('should clear spotlight and focus on node when searched employee is selected', async () => {
    server.use(getEmployeeHierarchyHandlers.defaultHandler);
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    server.use(getSearchEmployeesHandlers.defaultHandler);
    mockUseDialogContext.mockImplementation(() => ({
      closeDialog: jest.fn(),
      isDialogOfType: (dialogId: string) =>
        dialogId === 'org-chart.remove-filters',
      dialogState: {
        dialogId: 'org-chart.remove-filters',
        data: { employeeId: '16' }, // Peter - 16
      },
      openDialog: (...args: unknown[]) => mockOpenDialog(...args),
    }));

    renderWithWrapper(<OrgChart />, {
      router: {
        pathname: ORG_CHART_URL_BASE,
        query: {
          spotlight: generateOrgChartLink({
            spotlight: '2',
          }).replace(`${ORG_CHART_URL_BASE}?spotlight=`, ''),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId(`${TestIds.PersonCard}-2`)).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${TestIds.PersonCard}-16`),
    ).not.toBeInTheDocument(); // Peter 16

    // Remove spotlight
    userEvent.click(
      screen.getByText(t('search.remove-filters-dialog.continue')),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${TestIds.PersonCard}-16`),
      ).toBeInTheDocument();
    });
    // await waitFor(() => {
    //   expect(
    //     screen.getByTestId(`${TestIds.PersonCard}-16`),
    //   ).toBeInTheDocument();
    // });
  });
});
