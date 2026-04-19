import { render, screen, fireEvent } from '@testing-library/react';
import { useOrgUnitCardData } from '@personio-web/employees-organizations-gofer';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';

import { TestIds } from '../../../utils/test-ids';
import { NodeMap } from '../../../Nodes/constants';
import { toTranslate } from '../../../toTranslate';
import { MockOrgChartDataSourceContext } from '../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import { MockOrgChartPreferencesContext } from '../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { TreeLayoutProvider } from '../../../TreeLayout';
import { useCalcOrgUnitCardHeight } from './useCalcCardHeight';
import { OrgUnitCard } from './OrgUnitCard';

jest.mock('@personio-web/employees-organizations-gofer');
jest.mock('@personio-web/employees-organizations-feature-org-units');
jest.mock('./useCalcCardHeight');
jest.mock(
  './Sections/Members',
  jest.fn(() => ({ Members: () => <div>Members</div> })),
);

const mockUseCardData = useOrgUnitCardData as jest.MockedFunction<
  typeof useOrgUnitCardData
>;
const mockUseCalcOrgUnitCardHeight =
  useCalcOrgUnitCardHeight as jest.MockedFunction<
    typeof useCalcOrgUnitCardHeight
  >;
const mockUseOrgUnitDetailsState =
  useOrgUnitDetailsState as jest.MockedFunction<typeof useOrgUnitDetailsState>;

const mockData = { type: NodeMap.OrgUnit };
const createMockNode = (overrides = {}) => ({
  id: 'node1',
  data: mockData,
  children: [
    { id: 'node2', data: mockData },
    { id: 'node3', data: mockData },
  ],
  descendants: [
    { id: 'node1', data: mockData },
    { id: 'node2', data: mockData },
    { id: 'node3', data: mockData },
  ],
  ancestors: [{ id: 'node0', data: mockData }],
  parent: { children: [{ id: 'node1', data: mockData }] },
  ...overrides,
});

const renderWithContexts = (
  component: React.ReactElement,
  dataSourceProps = {},
  preferencesProps = {},
) => {
  const dataSource = {
    displayableHierarchy: {
      getNode: jest.fn().mockReturnValue(createMockNode()),
      nodes: [],
      rootNodes: [],
    },
    ...dataSourceProps,
  };
  return render(
    <DialogProvider>
      <TreeLayoutProvider>
        <MockOrgChartPreferencesContext {...preferencesProps}>
          <MockOrgChartDataSourceContext {...dataSource}>
            {component}
          </MockOrgChartDataSourceContext>
        </MockOrgChartPreferencesContext>
      </TreeLayoutProvider>
    </DialogProvider>,
  );
};

describe('OrgUnitCard', () => {
  const mockId = 'test-org-unit-id';
  const mockCardHeight = 120;

  const createMockCardData = (overrides = {}) => ({
    data: {
      name: 'Test Organization Unit',
      description: 'Test description',
      abbreviation: 'TOU',
      ...overrides,
    },
    status: 'success',
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCardData.mockReturnValue(createMockCardData() as never);
    mockUseCalcOrgUnitCardHeight.mockReturnValue(mockCardHeight);
    mockUseOrgUnitDetailsState.mockReturnValue({
      state: null,
      setState: jest.fn(),
      setStateWithCallback: jest.fn(),
      isDrawerFullyOpened: false,
    } as never);
  });

  describe('Basic Rendering', () => {
    it('should render the org unit card with name', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />);

      expect(screen.getByText('Test Organization Unit')).toBeInTheDocument();
      expect(screen.getByTestId(TestIds.OrgUnitCardName)).toBeInTheDocument();
    });

    it('should apply the calculated card height', () => {
      const { container } = renderWithContexts(<OrgUnitCard id={mockId} />);
      const cardShell = container.firstChild as HTMLElement;

      expect(cardShell).toHaveStyle({ height: `${mockCardHeight}px` });
    });

    it('should call useCardData with the correct id', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />);

      expect(mockUseCardData).toHaveBeenCalledWith(mockId);
    });
  });

  describe('Conditional Rendering', () => {
    it('should render description when present and customization is active', () => {
      renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {},
        {
          cardCustomisations: {
            entries: [],
            get: jest.fn().mockReturnValue({
              id: 'description',
              isActive: true,
            }),
            set: jest.fn(),
          },
        },
      );

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should not render description when customization is inactive', () => {
      renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {},
        {
          cardCustomisations: {
            entries: [],
            get: jest.fn().mockReturnValue({
              id: 'description',
              isActive: false,
            }),
            set: jest.fn(),
          },
        },
      );

      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('should not render description when falsy', () => {
      mockUseCardData.mockReturnValue(
        createMockCardData({ description: '' }) as never,
      );

      renderWithContexts(<OrgUnitCard id={mockId} />);

      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('should render abbreviation when present and customization is active', () => {
      renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {},
        {
          cardCustomisations: {
            entries: [],
            get: jest.fn().mockReturnValue({
              id: 'abbreviation',
              isActive: true,
            }),
            set: jest.fn(),
          },
        },
      );

      expect(screen.getByText('#TOU')).toBeInTheDocument();
    });

    it('should not render abbreviation when customization is inactive', () => {
      renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {},
        {
          cardCustomisations: {
            entries: [],
            get: jest.fn().mockReturnValue({
              id: 'abbreviation',
              isActive: false,
            }),
            set: jest.fn(),
          },
        },
      );

      expect(screen.queryByText('#TOU')).not.toBeInTheDocument();
    });

    it('should not render abbreviation when falsy', () => {
      mockUseCardData.mockReturnValue(
        createMockCardData({ abbreviation: '' }) as never,
      );

      renderWithContexts(<OrgUnitCard id={mockId} />);

      expect(screen.queryByText('#TOU')).not.toBeInTheDocument();
    });
  });

  describe('Span of Control', () => {
    it('should render span of control with direct and total subordinates', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />);

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toHaveTextContent('2 (2)');
    });

    it('should render only direct subordinates when no total subordinates', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />, {
        displayableHierarchy: {
          getNode: jest.fn().mockReturnValue(
            createMockNode({
              childrenCount: 2,
              descendants: [{ id: 'node1' }],
            }),
          ),
        },
      });

      const spanOfControl = screen.getByTestId(TestIds.SpanOfControl);
      expect(spanOfControl).toHaveTextContent('2');
      expect(spanOfControl).not.toHaveTextContent('2 (0)');
    });

    it('should render span of control with specific style when no subordinates', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />, {
        displayableHierarchy: {
          getNode: jest
            .fn()
            .mockReturnValue(createMockNode({ children: [], descendants: [] })),
        },
      });

      expect(screen.getByTestId(TestIds.SpanOfControl)).toHaveClass(
        'noSubCards',
      );
    });
  });

  describe('Clicking the card', () => {
    it('should expand it if its collapsed', () => {
      const mockNode = createMockNode();
      const mockSetExpanded = jest.fn();
      const setActiveCardId = jest.fn();

      const { container } = renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {
          displayableHierarchy: {
            getNode: jest.fn().mockReturnValue(mockNode),
          },
        },
        {
          setActiveCardId,
          expansionState: {
            expanded: [],
            setExpanded: mockSetExpanded,
            derivedExpandedIds: { current: null },
          },
        },
      );
      const cardShell = container.firstChild as HTMLElement;

      fireEvent.click(cardShell);

      expect(mockSetExpanded).toHaveBeenCalledWith(['node1']);
      expect(setActiveCardId).toHaveBeenCalledWith('node1', ['node0', 'node1']);
    });

    it('should activate the card if it is expanded and inactive', () => {
      const mockNode = createMockNode();
      const mockSetExpanded = jest.fn();
      const setActiveCardId = jest.fn();

      const { container } = renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {
          displayableHierarchy: {
            getNode: jest.fn().mockReturnValue(mockNode),
          },
        },
        {
          setActiveCardId,
          expansionState: {
            expanded: ['node1'],
            setExpanded: mockSetExpanded,
            derivedExpandedIds: { current: null },
          },
        },
      );
      const cardShell = container.firstChild as HTMLElement;

      fireEvent.click(cardShell);

      expect(mockSetExpanded).not.toHaveBeenCalled();
      expect(setActiveCardId).toHaveBeenCalledWith('node1', ['node0', 'node1']);
    });

    it('should collapse the card if it is expanded and active', () => {
      const mockNode = createMockNode();
      const mockSetExpanded = jest.fn();
      const setActiveCardId = jest.fn();
      const handleToggleExpand = jest.fn();

      const { container } = renderWithContexts(
        <OrgUnitCard id={mockId} />,
        {
          displayableHierarchy: {
            getNode: jest.fn().mockReturnValue(mockNode),
          },
        },
        {
          activeCardId: 'node1',
          setActiveCardId,
          expansionState: {
            expanded: ['node1'],
            setExpanded: mockSetExpanded,
            handleToggleExpand,
            derivedExpandedIds: { current: null },
          },
        },
      );
      const cardShell = container.firstChild as HTMLElement;

      fireEvent.click(cardShell);

      expect(mockSetExpanded).toHaveBeenCalledWith([]);
      expect(setActiveCardId).toHaveBeenCalledWith('node1', ['node0', 'node1']);
    });
  });

  describe('Clicking the title', () => {
    it('should open the org unit details drawer', () => {
      const setDetailsDrawer = jest.fn();
      mockUseOrgUnitDetailsState.mockReturnValue({
        state: null,
        setState: setDetailsDrawer,
        setStateWithCallback: jest.fn(),
        isDrawerFullyOpened: false,
      } as never);
      mockUseCardData.mockReturnValue(
        createMockCardData({
          type: 'ORG_UNIT_TYPE_DEPARTMENT',
          departmentId: {
            __typename: 'protocore_hrdepartmentid_DepartmentId_v1',
            id: '1',
          },
        }) as never,
      );
      renderWithContexts(<OrgUnitCard id={mockId} />);

      const title = screen.getByText('Test Organization Unit');
      fireEvent.click(title);

      expect(setDetailsDrawer).toHaveBeenCalledWith({
        orgUnitId: 1,
        orgUnitType: 'department',
      });
    });

    it('should not open the org unit details drawer if the org unit type is unspecified', () => {
      const setDetailsDrawer = jest.fn();
      mockUseOrgUnitDetailsState.mockReturnValue({
        state: null,
        setState: setDetailsDrawer,
        setStateWithCallback: jest.fn(),
        isDrawerFullyOpened: false,
      } as never);
      mockUseCardData.mockReturnValue(
        createMockCardData({
          type: 'ORG_UNIT_TYPE_UNSPECIFIED',
        }) as never,
      );
      renderWithContexts(<OrgUnitCard id={mockId} />);

      const title = screen.getByText('Test Organization Unit');
      fireEvent.click(title);

      expect(setDetailsDrawer).not.toHaveBeenCalled();
    });

    it('should not open the org unit details drawer if the org unit has unreadable id', () => {
      const setDetailsDrawer = jest.fn();
      mockUseOrgUnitDetailsState.mockReturnValue({
        state: null,
        setState: setDetailsDrawer,
        setStateWithCallback: jest.fn(),
        isDrawerFullyOpened: false,
      } as never);
      mockUseCardData.mockReturnValue(
        createMockCardData({
          type: 'ORG_UNIT_TYPE_TEAM',
          teamId: {
            __typename: 'protocore_hrteamid_TeamId_v1',
            id: 'not-a-number',
          },
        }) as never,
      );
      renderWithContexts(<OrgUnitCard id={mockId} />);

      const title = screen.getByText('Test Organization Unit');
      fireEvent.click(title);

      expect(setDetailsDrawer).not.toHaveBeenCalled();
    });
  });

  describe('Focus state', () => {
    it('should apply isFocused class when drawer details match card org unit id', () => {
      const setDetailsDrawer = jest.fn();
      mockUseOrgUnitDetailsState.mockReturnValue({
        state: { orgUnitId: 1, orgUnitType: 'department' },
        setState: setDetailsDrawer,
        setStateWithCallback: jest.fn(),
        isDrawerFullyOpened: true,
      } as never);
      mockUseCardData.mockReturnValue(
        createMockCardData({
          type: 'ORG_UNIT_TYPE_DEPARTMENT',
          departmentId: {
            __typename: 'protocore_hrdepartmentid_DepartmentId_v1',
            id: '1',
          },
        }) as never,
      );

      const { container } = renderWithContexts(<OrgUnitCard id={mockId} />);
      const cardShell = container.firstChild as HTMLElement;

      expect(cardShell).toHaveClass('isFocused');
    });

    it('should not apply isFocused class when drawer details do not match card org unit id', () => {
      const setDetailsDrawer = jest.fn();
      mockUseOrgUnitDetailsState.mockReturnValue({
        state: { orgUnitId: 2, orgUnitType: 'department' },
        setState: setDetailsDrawer,
        setStateWithCallback: jest.fn(),
        isDrawerFullyOpened: true,
      } as never);
      mockUseCardData.mockReturnValue(
        createMockCardData({
          type: 'ORG_UNIT_TYPE_DEPARTMENT',
          departmentId: {
            __typename: 'protocore_hrdepartmentid_DepartmentId_v1',
            id: '1',
          },
        }) as never,
      );

      const { container } = renderWithContexts(<OrgUnitCard id={mockId} />);
      const cardShell = container.firstChild as HTMLElement;

      expect(cardShell).not.toHaveClass('isFocused');
    });

    it('should work with team type org units', () => {
      const setDetailsDrawer = jest.fn();
      mockUseOrgUnitDetailsState.mockReturnValue({
        state: { orgUnitId: 42, orgUnitType: 'team' },
        setState: setDetailsDrawer,
        setStateWithCallback: jest.fn(),
        isDrawerFullyOpened: true,
      } as never);
      mockUseCardData.mockReturnValue(
        createMockCardData({
          type: 'ORG_UNIT_TYPE_TEAM',
          teamId: {
            __typename: 'protocore_hrteamid_TeamId_v1',
            id: '42',
          },
        }) as never,
      );

      const { container } = renderWithContexts(<OrgUnitCard id={mockId} />);
      const cardShell = container.firstChild as HTMLElement;

      expect(cardShell).toHaveClass('isFocused');
    });
  });

  describe('Accessibility', () => {
    it('should have tabIndex attribute on CardShell', () => {
      const { container } = renderWithContexts(<OrgUnitCard id={mockId} />);
      const cardShell = container.firstChild as HTMLElement;

      expect(cardShell).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Unmatched Org Unit', () => {
    it('should render the unmatched org unit card for team type', () => {
      mockUseCardData.mockReturnValue(
        createMockCardData({ type: 'ORG_UNIT_TYPE_TEAM' }) as never,
      );

      renderWithContexts(<OrgUnitCard id={mockId} />, {
        displayableHierarchy: {
          getNode: jest
            .fn()
            .mockReturnValue(
              createMockNode({ data: { type: NodeMap.UnmatchedOrgUnit } }),
            ),
        },
      });

      expect(
        screen.getByText(
          toTranslate.orgUnitCard.unmatchedDescription.replace(
            '{{orgunitType}}',
            toTranslate.orgUnitCard.unmatchedType.team,
          ),
        ),
      ).toBeInTheDocument();
    });

    it('should render the unmatched org unit card for department type', () => {
      mockUseCardData.mockReturnValue(
        createMockCardData({ type: 'ORG_UNIT_TYPE_DEPARTMENT' }) as never,
      );

      renderWithContexts(<OrgUnitCard id={mockId} />, {
        displayableHierarchy: {
          getNode: jest
            .fn()
            .mockReturnValue(
              createMockNode({ data: { type: NodeMap.UnmatchedOrgUnit } }),
            ),
        },
      });

      expect(
        screen.getByText(
          toTranslate.orgUnitCard.unmatchedDescription.replace(
            '{{orgunitType}}',
            toTranslate.orgUnitCard.unmatchedType.department,
          ),
        ),
      ).toBeInTheDocument();
    });

    it('should apply unmatched class to name and description', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />, {
        displayableHierarchy: {
          getNode: jest
            .fn()
            .mockReturnValue(
              createMockNode({ data: { type: NodeMap.UnmatchedOrgUnit } }),
            ),
        },
      });

      const name = screen.getByTestId(TestIds.OrgUnitCardName);
      const description = screen.getByText(
        toTranslate.orgUnitCard.unmatchedDescription.replace(
          '{{orgunitType}}',
          toTranslate.orgUnitCard.unmatchedType.team,
        ),
      );

      expect(name).toHaveClass('unmatched');
      expect(description).toHaveClass('unmatched');
    });

    it('should not render Members component when unmatched', () => {
      renderWithContexts(<OrgUnitCard id={mockId} />, {
        displayableHierarchy: {
          getNode: jest
            .fn()
            .mockReturnValue(
              createMockNode({ data: { type: NodeMap.UnmatchedOrgUnit } }),
            ),
        },
      });

      expect(screen.queryByText('Members')).not.toBeInTheDocument();
    });
  });
});
