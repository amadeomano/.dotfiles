import { renderHook } from '@testing-library/react';
import { useQueries } from '@tanstack/react-query';

import { useAuthContext } from '@personio-web/auth-context';
import {
  ListOrgUnitsQueryResult,
  orgUnitCardDataBatcher,
} from '@personio-web/employees-organizations-gofer';

import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../../contexts';
import { useTotalMembersCount } from './useTotalMembersCount';

jest.mock('@tanstack/react-query');
jest.mock('@personio-web/auth-context');
jest.mock('@personio-web/employees-organizations-gofer');
jest.mock('../../../../contexts');

const mockUseQueries = useQueries as jest.MockedFunction<typeof useQueries>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseOrgChartDataSourceContext =
  useOrgChartDataSourceContext as jest.MockedFunction<
    typeof useOrgChartDataSourceContext
  >;
const mockUseOrgChartPreferencesContext =
  useOrgChartPreferencesContext as jest.MockedFunction<
    typeof useOrgChartPreferencesContext
  >;
const mockOrgUnitCardDataBatcher = orgUnitCardDataBatcher as jest.Mocked<
  typeof orgUnitCardDataBatcher
>;

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

describe('useTotalMembersCount', () => {
  const mockCompanyId = 'test-company-id';
  const mockOrgUnitId = 'test-org-unit-id';

  const createMockOrgUnit = (overrides = {}): OrgUnit =>
    ({
      id: { id: mockOrgUnitId },
      name: 'Test Org Unit',
      ...overrides,
    } as OrgUnit);

  const createMockNode = (overrides = {}) => ({
    id: mockOrgUnitId,
    descendants: [
      { id: 'descendant-1' },
      { id: 'descendant-2' },
      { id: 'descendant-3' },
    ],
    ...overrides,
  });

  const getMockDataSource = (
    node: ReturnType<typeof createMockNode> | null,
  ) => ({
    completeHierarchyData: {
      data: { hierarchy: { getNode: jest.fn().mockReturnValue(node) } },
    },
  });

  const createMockPreferences = (isTotalMembersActive = true) => ({
    cardCustomisations: {
      get: jest.fn().mockReturnValue({ isActive: isTotalMembersActive }),
    },
  });

  const createMockQueryResult = (overrides = {}) => ({
    data: { directMemberCount: 5 },
    isLoading: false,
    isError: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthContext.mockReturnValue({ companyId: mockCompanyId } as never);

    mockUseOrgChartDataSourceContext.mockReturnValue(
      getMockDataSource(createMockNode()) as never,
    );

    mockUseOrgChartPreferencesContext.mockReturnValue(
      createMockPreferences() as never,
    );

    mockUseQueries.mockReturnValue([
      createMockQueryResult(),
      createMockQueryResult(),
      createMockQueryResult(),
    ] as never);
  });

  describe('Basic Functionality', () => {
    it('should return the sum of direct member counts from descendants when totalMembers is active', () => {
      const mockOrgUnit = createMockOrgUnit();

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBe(15); // 3 descendants × 5 members each
    });

    it('should call useQueries with correct query configurations when totalMembers is active', () => {
      const mockOrgUnit = createMockOrgUnit();

      renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: [
          {
            queryKey: ['OrgUnitCard', 'descendant-1'],
            queryFn: expect.any(Function),
            enabled: true,
            staleTime: 10 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
          },
          {
            queryKey: ['OrgUnitCard', 'descendant-2'],
            queryFn: expect.any(Function),
            enabled: true,
            staleTime: 10 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
          },
          {
            queryKey: ['OrgUnitCard', 'descendant-3'],
            queryFn: expect.any(Function),
            enabled: true,
            staleTime: 10 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
          },
        ],
      });
    });

    it('should call orgUnitCardDataBatcher.fetch with correct parameters when totalMembers is active', () => {
      const mockOrgUnit = createMockOrgUnit();
      mockOrgUnitCardDataBatcher.fetch.mockResolvedValue({
        directMemberCount: 5,
      } as never);

      renderHook(() => useTotalMembersCount(mockOrgUnit));

      // Get the query functions from the mock call
      const queriesCall = mockUseQueries.mock.calls[0][0] as {
        queries: Array<{ queryFn: () => Promise<any> }>;
      };

      // Execute one of the query functions to verify it calls the batcher correctly
      queriesCall.queries[0].queryFn();

      expect(mockOrgUnitCardDataBatcher.fetch).toHaveBeenCalledWith({
        id: 'descendant-1',
        companyId: mockCompanyId,
      });
    });
  });

  describe('Total Members Customization', () => {
    it('should return 0 when totalMembers customization is not active', () => {
      const mockOrgUnit = createMockOrgUnit();
      mockUseOrgChartPreferencesContext.mockReturnValue(
        createMockPreferences(false) as never,
      );

      mockUseQueries.mockReturnValue([] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBe(0);
      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: [],
      });
    });

    it('should call cardCustomisations.get with correct parameter', () => {
      const mockOrgUnit = createMockOrgUnit();
      const mockGet = jest.fn().mockReturnValue({ isActive: true });
      mockUseOrgChartPreferencesContext.mockReturnValue({
        cardCustomisations: { get: mockGet },
      } as never);

      renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(mockGet).toHaveBeenCalledWith('totalMembers');
    });
  });

  describe('Loading State', () => {
    it('should return null when any query is loading', () => {
      const mockOrgUnit = createMockOrgUnit();

      mockUseQueries.mockReturnValue([
        createMockQueryResult(),
        createMockQueryResult({ isFetching: true }),
        createMockQueryResult(),
      ] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBeNull();
    });
  });

  describe('Error State', () => {
    it('should return null when any query has an error', () => {
      const mockOrgUnit = createMockOrgUnit();

      mockUseQueries.mockReturnValue([
        createMockQueryResult(),
        createMockQueryResult({ isError: true }),
        createMockQueryResult(),
      ] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should return 0 when org unit has no descendants', () => {
      const mockOrgUnit = createMockOrgUnit();

      mockUseOrgChartDataSourceContext.mockReturnValue(
        getMockDataSource(createMockNode({ descendants: [] })) as never,
      );

      mockUseQueries.mockReturnValue([] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBe(0);
    });

    it('should return 0 when node is not found in hierarchy', () => {
      const mockOrgUnit = createMockOrgUnit();

      mockUseOrgChartDataSourceContext.mockReturnValue(
        getMockDataSource(null) as never,
      );

      mockUseQueries.mockReturnValue([] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBe(0);
    });

    it('should handle null/undefined directMemberCount values', () => {
      const mockOrgUnit = createMockOrgUnit();

      mockUseQueries.mockReturnValue([
        createMockQueryResult({ data: { directMemberCount: null } }),
        createMockQueryResult({ data: { directMemberCount: undefined } }),
        createMockQueryResult({ data: { directMemberCount: 10 } }),
      ] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBe(10); // Only the valid count should be included
    });

    it('should handle missing data in query results', () => {
      const mockOrgUnit = createMockOrgUnit();

      mockUseQueries.mockReturnValue([
        createMockQueryResult({ data: null }),
        createMockQueryResult({ data: undefined }),
        createMockQueryResult({ data: { directMemberCount: 7 } }),
      ] as never);

      const { result } = renderHook(() => useTotalMembersCount(mockOrgUnit));

      expect(result.current).toBe(7); // Only the valid data should be included
    });
  });
});
