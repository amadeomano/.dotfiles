import { Controls } from 'designSystem/component/control-bar';
import type { FilterConfig } from 'designSystem/component/advanced-filter';

import * as createOrgUnitsFilterConfigModule from '@personio-web/employees-organizations-hook-use-people-filter-config/src/utils/createOrgUnitsFilterConfig';
import * as createMultiSelectFilterConfigModule from '@personio-web/employees-organizations-hook-use-people-filter-config/src/utils/createMultiSelectFilterConfig';
import * as utilPeople from '@personio-web/employees-organizations-util-people';
import * as useAuthContextModule from '@personio-web/auth-context';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';
import * as useQueryOrgUnitsModule from '@personio-web/employees-organizations-hook-use-query-org-units';

import * as useOrgChartPreferencesContextModule from '../../../contexts';
import { TestIds } from '../../../utils';
import { mockOrgChartPreferencesProps } from '../../../../test-setup/testHelpers';
import { OrgUnitFilters } from './OrgUnitFilters';

const mockControlsFilter = jest
  .spyOn(Controls, 'Filter')
  .mockImplementation(jest.fn());

const mockUseAuthContext = jest
  .spyOn(useAuthContextModule, 'useAuthContext')
  .mockImplementation(jest.fn());

const mockUseOrgChartPreferencesContext = jest
  .spyOn(useOrgChartPreferencesContextModule, 'useOrgChartPreferencesContext')
  .mockImplementation(jest.fn());

const mockCreateOrgUnitsFilterConfig = jest
  .spyOn(createOrgUnitsFilterConfigModule, 'createOrgUnitsFilterConfig')
  .mockImplementation(jest.fn());

const mockCreateMultiSelectFilterConfig = jest
  .spyOn(createMultiSelectFilterConfigModule, 'createMultiSelectFilterConfig')
  .mockImplementation(jest.fn());

const mockGetAttributeIcon = jest
  .spyOn(utilPeople, 'getAttributeIcon')
  .mockImplementation(jest.fn());

const mockUseQueryOrgUnits = jest
  .spyOn(useQueryOrgUnitsModule, 'useQueryOrgUnits')
  .mockImplementation(jest.fn());

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('OrgUnitFilters', () => {
  const getPrefs = (
    overrides: Partial<typeof mockOrgChartPreferencesProps> = {},
  ) => ({
    ...mockOrgChartPreferencesProps,
    ...overrides,
  });

  const mockCompanyId = 123;
  const mockEmployeeId = 456;
  // Minimal valid FilterConfig for testing
  const mockFilterConfig: FilterConfig = {
    columnId: PersonSystemAttribute.Department,
    field: 'select',
    conditions: ['contains'],
    getOptions: async () => [],
  };
  const assertionColumnConfigDepartment = [
    {
      id: PersonSystemAttribute.Department,
      header: 'department_id',
      icon: undefined,
    },
    {
      id: PersonSystemAttribute.Team,
      header: 'team_id',
      icon: undefined,
    },
    {
      id: PersonSystemAttribute.Office,
      header: 'office_id',
      icon: undefined,
    },
    {
      id: PersonSystemAttribute.LegalEntity,
      header: 'subcompany_id',
      icon: undefined,
    },
  ];

  const assertionColumnConfigTeam = [
    {
      id: PersonSystemAttribute.Team,
      header: 'team_id',
      icon: undefined,
    },
    {
      id: PersonSystemAttribute.Department,
      header: 'department_id',
      icon: undefined,
    },
    {
      id: PersonSystemAttribute.Office,
      header: 'office_id',
      icon: undefined,
    },
    {
      id: PersonSystemAttribute.LegalEntity,
      header: 'subcompany_id',
      icon: undefined,
    },
  ];

  const mockDepartments = {
    orgUnits: [],
  };

  const mockTeams = {
    orgUnits: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-expect-error - enough for testing, we only need employeeId
    mockUseAuthContext.mockReturnValue({
      companyId: mockCompanyId,
      entityType: 'employee',
      employeeId: mockEmployeeId,
    });
    mockUseOrgChartPreferencesContext.mockReturnValue(
      getPrefs({ source: 'Department' }),
    );
    mockCreateOrgUnitsFilterConfig.mockReturnValue(mockFilterConfig);
    mockCreateMultiSelectFilterConfig.mockReturnValue(mockFilterConfig);
    // @ts-expect-error - enough for testing
    mockGetAttributeIcon.mockReturnValue(undefined);
    // Mock both department and team queries
    mockUseQueryOrgUnits
      .mockReturnValueOnce(mockDepartments)
      .mockReturnValueOnce(mockTeams);
    mockControlsFilter.mockImplementation((props) => (
      <div
        data-testid={props.metadata?.testId}
        data-props={JSON.stringify(props)}
      >
        Mocked Controls.Filter
      </div>
    ));
  });

  const renderFilters = (
    prefsOverride: Partial<typeof mockOrgChartPreferencesProps> = {},
  ) => {
    mockUseOrgChartPreferencesContext.mockReturnValue(getPrefs(prefsOverride));
    return renderWithWrapper(<OrgUnitFilters />);
  };

  it('should render Controls.Filter with correct props for Department source', () => {
    renderFilters({ source: 'Department' });

    // Should call useQueryOrgUnits twice - once for departments, once for teams
    expect(mockUseQueryOrgUnits).toHaveBeenCalledTimes(2);
    expect(mockUseQueryOrgUnits).toHaveBeenNthCalledWith(1, {
      source: 'org-units-table',
      type: 'department',
      useLegacyId: true,
      queryConfig: {
        autoFetchNextPage: true,
        additionalParams: {
          includeDescendants: true,
          includeDepartmentId: true,
          includeTeamId: true,
        },
      },
    });
    expect(mockUseQueryOrgUnits).toHaveBeenNthCalledWith(2, {
      source: 'org-units-table',
      type: 'team',
      useLegacyId: true,
      queryConfig: {
        autoFetchNextPage: true,
        additionalParams: {
          includeDescendants: true,
          includeDepartmentId: true,
          includeTeamId: true,
        },
      },
    });

    // Should create filter configs for both Department and Team
    expect(mockCreateOrgUnitsFilterConfig).toHaveBeenCalledWith(
      PersonSystemAttribute.Department,
      false,
      '',
      undefined,
      ['contains'],
      [],
    );
    expect(mockCreateOrgUnitsFilterConfig).toHaveBeenCalledWith(
      PersonSystemAttribute.Team,
      false,
      '',
      undefined,
      ['contains'],
      [],
    );
    expect(mockCreateMultiSelectFilterConfig).toHaveBeenCalledWith(
      mockEmployeeId,
      PersonSystemAttribute.Office,
      false,
      '',
    );
    expect(mockCreateMultiSelectFilterConfig).toHaveBeenCalledWith(
      mockEmployeeId,
      PersonSystemAttribute.LegalEntity,
      false,
      '',
    );
    expect(mockControlsFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: mockOrgChartPreferencesProps.filters,
        filterConfig: [
          mockFilterConfig,
          mockFilterConfig,
          mockFilterConfig,
          mockFilterConfig,
        ],
        columnConfig: assertionColumnConfigDepartment,
        metadata: { testId: TestIds.ControlBarFilter },
        onChange: expect.any(Function),
      }),
      {},
    );
  });

  it('should render Controls.Filter with team config when source is Team', () => {
    renderFilters({ source: 'Team' });

    // Should call useQueryOrgUnits twice - once for departments, once for teams
    expect(mockUseQueryOrgUnits).toHaveBeenCalledTimes(2);
    expect(mockUseQueryOrgUnits).toHaveBeenNthCalledWith(1, {
      source: 'org-units-table',
      type: 'department',
      useLegacyId: true,
      queryConfig: {
        autoFetchNextPage: true,
        additionalParams: {
          includeDescendants: true,
          includeDepartmentId: true,
          includeTeamId: true,
        },
      },
    });
    expect(mockUseQueryOrgUnits).toHaveBeenNthCalledWith(2, {
      source: 'org-units-table',
      type: 'team',
      useLegacyId: true,
      queryConfig: {
        autoFetchNextPage: true,
        additionalParams: {
          includeDescendants: true,
          includeDepartmentId: true,
          includeTeamId: true,
        },
      },
    });

    // Should create filter configs for both Team and Department
    expect(mockCreateOrgUnitsFilterConfig).toHaveBeenCalledWith(
      PersonSystemAttribute.Team,
      false,
      '',
      undefined,
      ['contains'],
      [],
    );
    expect(mockCreateOrgUnitsFilterConfig).toHaveBeenCalledWith(
      PersonSystemAttribute.Department,
      false,
      '',
      undefined,
      ['contains'],
      [],
    );
    expect(mockCreateMultiSelectFilterConfig).toHaveBeenCalledWith(
      mockEmployeeId,
      PersonSystemAttribute.Office,
      false,
      '',
    );
    expect(mockCreateMultiSelectFilterConfig).toHaveBeenCalledWith(
      mockEmployeeId,
      PersonSystemAttribute.LegalEntity,
      false,
      '',
    );
    expect(mockControlsFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: mockOrgChartPreferencesProps.filters,
        filterConfig: [
          mockFilterConfig,
          mockFilterConfig,
          mockFilterConfig,
          mockFilterConfig,
        ],
        columnConfig: assertionColumnConfigTeam,
        metadata: { testId: TestIds.ControlBarFilter },
        onChange: expect.any(Function),
      }),
      {},
    );
  });

  it('should map Department filter to departments query data and Team filter to teams query data', () => {
    const mockDepartmentsWithData = {
      orgUnits: [{ id: 'dept1', name: 'Department 1' }],
    };
    const mockTeamsWithData = {
      orgUnits: [{ id: 'team1', name: 'Team 1' }],
    };

    // Clear and reset mock to override beforeEach setup
    mockUseQueryOrgUnits.mockReset();
    mockUseQueryOrgUnits
      .mockReturnValueOnce(mockDepartmentsWithData)
      .mockReturnValueOnce(mockTeamsWithData);

    renderWithWrapper(<OrgUnitFilters />);

    // Department filter should get departments data
    expect(mockCreateOrgUnitsFilterConfig).toHaveBeenNthCalledWith(
      1,
      PersonSystemAttribute.Department,
      false,
      '',
      undefined,
      ['contains'],
      [{ id: 'dept1', name: 'Department 1' }],
    );

    // Team filter should get teams data
    expect(mockCreateOrgUnitsFilterConfig).toHaveBeenNthCalledWith(
      2,
      PersonSystemAttribute.Team,
      false,
      '',
      undefined,
      ['contains'],
      [{ id: 'team1', name: 'Team 1' }],
    );
  });

  it('should reset view, activeCardId and expansionState and viewport if view is set when filters change', () => {
    const setMultiplePrefs = jest.fn();
    const setView = jest.fn();
    const requestNewState = jest.fn();
    renderFilters({
      setMultiplePrefs,
      setView,
      view: 'all-people',
      source: 'Department',
      viewportState: { requestedState: null, requestNewState },
    });
    const onChange = mockControlsFilter.mock.calls[0][0].onChange;
    const filters = [
      {
        id: PersonSystemAttribute.Department,
        value: { value: 'HR', condition: 'contains' },
      },
    ];
    onChange?.(filters);
    expect(setView).toHaveBeenCalledWith(null);
    expect(setMultiplePrefs).toHaveBeenCalledWith({
      filters,
      activeCardId: null,
      expansionState: [],
    });
    expect(requestNewState).toHaveBeenCalledWith({
      mode: 'resetViewport',
      animated: true,
    });
  });

  it('should not call setView if view is null when filters change', () => {
    const setView = jest.fn();
    renderFilters({ setView, view: null, source: 'Department' });
    const onChange = mockControlsFilter.mock.calls[0][0].onChange;
    const filters = [
      {
        id: PersonSystemAttribute.Department,
        value: { value: 'HR', condition: 'contains' },
      },
    ];
    if (onChange) onChange(filters);
    expect(setView).not.toHaveBeenCalled();
  });

  it('should reset viewport if activeCardId is set and filters are cleared', () => {
    const requestNewState = jest.fn();
    renderFilters({
      activeCardId: 'active-card-id',
      viewportState: { requestedState: null, requestNewState },
      source: 'Department',
    });
    const onChange = mockControlsFilter.mock.calls[0][0].onChange;
    onChange?.([]);
    expect(requestNewState).toHaveBeenCalledWith({
      mode: 'fitNode',
      animated: true,
      nodeId: 'active-card-id',
      includeChildrenAndParent: true,
    });
  });

  it('should have correct display name', () => {
    expect(OrgUnitFilters.displayName).toBe('Controls.Filter');
  });
});
