import set from 'lodash/set';

import * as EOGofer from '@personio-web/employees-organizations-gofer';
import * as EODataSearchEmployees from '@personio-web/employees-organizations-data-search-employees';

import { MockOrgChartPreferencesContext as PrefContext } from '../../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartDataSourceContext as DataSourceContext } from '../../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import {
  renderHookWithWrapper,
  getTranslation,
} from '../../../../../test-setup/testHelpers';
import {
  useGetOrgUnitSearchResults,
  ORG_UNIT_PREFIX,
} from './useGetOrgUnitSearchResults';

const useListOrgUnits = jest
  .spyOn(EOGofer, 'useListOrgUnits')
  .mockImplementation(jest.fn())
  .mockReturnValue({ isFetching: false } as never);

const useGetSearchEmployees = jest
  .spyOn(EODataSearchEmployees, 'useGetSearchEmployees')
  .mockImplementation(jest.fn())
  .mockReturnValue({ isFetching: false } as never);

const { t } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.control-bar.org-unit-search',
});

describe('useGetOrgUnitSearchResults', () => {
  it('should not call the API if searchTerm is undefined', () => {
    const { result } = renderHookWithWrapper(
      () => useGetOrgUnitSearchResults({ searchTerm: undefined }),
      {
        innerWrapper: ({ children }) => (
          <PrefContext>
            <DataSourceContext>{children}</DataSourceContext>
          </PrefContext>
        ),
      },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.searchResults).toEqual([]);
    expect(useListOrgUnits).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryOptions: { enabled: false },
      }),
    );
    expect(useGetSearchEmployees).toHaveBeenNthCalledWith(1, {
      requestQuery: { query: undefined },
      enabled: false,
    });
  });

  it('should call the API with the correct variables if searchTerm is defined', () => {
    const { result } = renderHookWithWrapper(
      () => useGetOrgUnitSearchResults({ searchTerm: 'test' }),
      {
        innerWrapper: ({ children }) => (
          <PrefContext source="Department">
            <DataSourceContext>{children}</DataSourceContext>
          </PrefContext>
        ),
      },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.searchResults).toEqual([]);
    expect(useListOrgUnits).toHaveBeenNthCalledWith(1, {
      variables: {
        companyId: 123,
        filter: "type == department && name.contains('test')",
      },
      queryOptions: { enabled: true },
    });
    expect(useGetSearchEmployees).toHaveBeenNthCalledWith(1, {
      requestQuery: { query: 'test' },
      enabled: true,
    });
  });

  it('should map the results to the correct format', () => {
    const orgUnitsData = set({}, 'data.orgUnits.orgUnitsList', [
      { id: { id: '1' }, name: 'Department 1' },
      { id: { id: '2' }, name: 'Department 2' },
    ]);
    const employeesData = set({}, 'data.employees', [
      { id: '1', name: 'Test Employee 1', avatar: 'avatar-1' },
      { id: '2', name: 'Test Employee 2', avatar: 'avatar-2' },
      { id: '3', name: 'Employee 3', avatar: 'avatar-3' },
    ]);

    // @ts-expect-error enough for the test
    useListOrgUnits.mockReturnValue({
      isFetching: false,
      isSuccess: true,
      data: orgUnitsData,
    });
    // @ts-expect-error enough for the test
    useGetSearchEmployees.mockReturnValue({
      isFetching: false,
      isSuccess: true,
      data: employeesData,
    });

    const hierarchyNodes = [
      { id: '1', entity_id: '1', type: 'org-unit' as const, parent_id: null },
      { id: '2', entity_id: '2', type: 'org-unit' as const, parent_id: null },
    ];

    const { result } = renderHookWithWrapper(
      () => useGetOrgUnitSearchResults({ searchTerm: 'test' }),
      {
        innerWrapper: ({ children }) => (
          <PrefContext>
            <DataSourceContext
              completeHierarchyData={
                {
                  data: {
                    source: 'Team' as const,
                    hierarchy: {
                      nodes: hierarchyNodes,
                      rootNodes: [],
                      getNode: jest.fn(),
                    },
                  },
                  isLoading: false,
                } as never
              }
            >
              {children}
            </DataSourceContext>
          </PrefContext>
        ),
      },
    );

    expect(result.current.isLoading).toBe(false);

    const ids = result.current.searchResults.map((r) => r.value);
    expect(ids).toEqual([
      `${ORG_UNIT_PREFIX}1`,
      `${ORG_UNIT_PREFIX}2`,
      '1',
      '2',
    ]);

    const labels = result.current.searchResults.map((r) => r.label);
    expect(labels.map((l) => (l as any).props.label)).toEqual([
      'Department 1',
      'Department 2',
      'Test Employee 1',
      'Test Employee 2',
    ]);

    const groups = result.current.searchResults.map((r) => r.group);
    expect(groups).toEqual([
      t('group_teams'),
      undefined,
      t('group_people'),
      undefined,
    ]);
  });

  it('should filter out org units not in the complete hierarchy', () => {
    const orgUnitsData = set({}, 'data.orgUnits.orgUnitsList', [
      { id: { id: '1' }, name: 'Department 1' },
      { id: { id: '2' }, name: 'Department 2' },
      { id: { id: '3' }, name: 'Department 3' },
    ]);

    // @ts-expect-error enough for the test
    useListOrgUnits.mockReturnValue({
      isFetching: false,
      isSuccess: true,
      data: orgUnitsData,
    });
    // @ts-expect-error enough for the test
    useGetSearchEmployees.mockReturnValue({
      isFetching: false,
      isSuccess: true,
      data: { data: { employees: [] } },
    });

    const hierarchyNodes = [
      { id: '1', entity_id: '1', type: 'org-unit' as const, parent_id: null },
      { id: '3', entity_id: '3', type: 'org-unit' as const, parent_id: null },
      // Note: Department 2 (entity_id: '2') is NOT in the hierarchy
    ];

    const { result } = renderHookWithWrapper(
      () => useGetOrgUnitSearchResults({ searchTerm: 'test' }),
      {
        innerWrapper: ({ children }) => (
          <PrefContext source="Department">
            <DataSourceContext
              completeHierarchyData={
                {
                  data: {
                    source: 'Department' as const,
                    hierarchy: {
                      nodes: hierarchyNodes,
                      rootNodes: [],
                      getNode: jest.fn(),
                    },
                  },
                  isLoading: false,
                } as never
              }
            >
              {children}
            </DataSourceContext>
          </PrefContext>
        ),
      },
    );

    expect(result.current.isLoading).toBe(false);

    // Should only include departments 1 and 3, not 2
    const ids = result.current.searchResults.map((r) => r.value);
    expect(ids).toEqual([`${ORG_UNIT_PREFIX}1`, `${ORG_UNIT_PREFIX}3`]);

    const labels = result.current.searchResults.map((r) => r.label);
    expect(labels.map((l) => (l as any).props.label)).toEqual([
      'Department 1',
      'Department 3',
    ]);
  });
});
