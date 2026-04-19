import { renderHook } from '@testing-library/react';
import set from 'lodash/set';

import * as EOGofer from '@personio-web/employees-organizations-gofer';

import { MockOrgChartPreferencesContext as PrefContext } from '../../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartDataSourceContext as DataSourceContext } from '../../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import { useGetOrgUnitByEmployeeId } from './useGetOrgUnitByEmployeeId';

const useFilterOrgUnitsByEmployees = jest
  .spyOn(EOGofer, 'useFilterOrgUnitsByEmployees')
  .mockImplementation(jest.fn())
  .mockReturnValue({ isFetching: false, isFetched: false } as never);

const getNode = jest.fn();

describe('useGetOrgUnitByEmployeeId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getNode.mockReturnValue(undefined);
  });

  describe('when employeeId is null', () => {
    it('should not call the API and return default values', () => {
      const { result } = renderHook(() => useGetOrgUnitByEmployeeId(null), {
        wrapper: ({ children }) => (
          <PrefContext source="Department">
            {/* @ts-expect-error enough for the test */}
            <DataSourceContext displayableHierarchy={{ getNode }}>
              {children}
            </DataSourceContext>
          </PrefContext>
        ),
      });

      expect(result.current).toEqual({
        node: undefined,
        isLoading: false,
        isFetched: false,
      });

      expect(useFilterOrgUnitsByEmployees).toHaveBeenNthCalledWith(1, {
        variables: {
          filterExp: "person_id == 'null'",
          includeDepartment: true,
          includeTeam: true,
        },
        queryOptions: { enabled: false },
      });
    });
  });

  describe('when employeeId is provided', () => {
    it('should call the API with the correct variables', () => {
      const { result } = renderHook(
        () => useGetOrgUnitByEmployeeId('employee-123'),
        {
          wrapper: ({ children }) => (
            <PrefContext source="Department">
              {/* @ts-expect-error enough for the test */}
              <DataSourceContext displayableHierarchy={{ getNode }}>
                {children}
              </DataSourceContext>
            </PrefContext>
          ),
        },
      );

      expect(result.current).toEqual({
        node: undefined,
        isLoading: false,
        isFetched: false,
      });

      expect(useFilterOrgUnitsByEmployees).toHaveBeenNthCalledWith(1, {
        variables: {
          filterExp: "person_id == 'employee-123'",
          includeDepartment: true,
          includeTeam: true,
        },
        queryOptions: { enabled: true },
      });
    });

    describe('when source is Department', () => {
      it('should return department org unit when data is available', () => {
        const departmentNode = { id: 'dept-1', name: 'Department 1' };
        const orgUnitsData = set(
          {},
          'data.result.employmentsList.0.department.id.id',
          'dept-1',
        );

        // @ts-expect-error enough for the test
        useFilterOrgUnitsByEmployees.mockReturnValue({
          isFetching: false,
          isFetched: true,
          data: orgUnitsData,
        });
        getNode.mockReturnValue(departmentNode);

        const { result } = renderHook(
          () => useGetOrgUnitByEmployeeId('employee-123'),
          {
            wrapper: ({ children }) => (
              <PrefContext source="Department">
                {/* @ts-expect-error enough for the test */}
                <DataSourceContext displayableHierarchy={{ getNode }}>
                  {children}
                </DataSourceContext>
              </PrefContext>
            ),
          },
        );

        expect(result.current).toEqual({
          node: departmentNode,
          isLoading: false,
          isFetched: true,
        });

        expect(getNode).toHaveBeenCalledWith('dept-1');
      });

      it('should return undefined when department data is not available', () => {
        const orgUnitsData = set(
          {},
          'data.result.employmentsList.0.department',
          null,
        );

        // @ts-expect-error enough for the test
        useFilterOrgUnitsByEmployees.mockReturnValue({
          isFetching: false,
          isFetched: true,
          data: orgUnitsData,
        });

        const { result } = renderHook(
          () => useGetOrgUnitByEmployeeId('employee-123'),
          {
            wrapper: ({ children }) => (
              <PrefContext source="Department">
                {/* @ts-expect-error enough for the test */}
                <DataSourceContext displayableHierarchy={{ getNode }}>
                  {children}
                </DataSourceContext>
              </PrefContext>
            ),
          },
        );

        expect(result.current).toEqual({
          node: undefined,
          isLoading: false,
          isFetched: true,
        });

        expect(getNode).not.toHaveBeenCalled();
      });
    });

    describe('when source is Team', () => {
      it('should return team org unit when data is available', () => {
        const teamNode = { id: 'team-1', name: 'Team 1' };
        const orgUnitsData = set(
          {},
          'data.result.employmentsList.0.teamOrgUnit.id.id',
          'team-1',
        );

        // @ts-expect-error enough for the test
        useFilterOrgUnitsByEmployees.mockReturnValue({
          isFetching: false,
          isFetched: true,
          data: orgUnitsData,
        });
        getNode.mockReturnValue(teamNode);

        const { result } = renderHook(
          () => useGetOrgUnitByEmployeeId('employee-123'),
          {
            wrapper: ({ children }) => (
              <PrefContext source="Team">
                {/* @ts-expect-error enough for the test */}
                <DataSourceContext displayableHierarchy={{ getNode }}>
                  {children}
                </DataSourceContext>
              </PrefContext>
            ),
          },
        );

        expect(result.current).toEqual({
          node: teamNode,
          isLoading: false,
          isFetched: true,
        });

        expect(getNode).toHaveBeenCalledWith('team-1');
      });

      it('should return undefined when team data is not available', () => {
        const orgUnitsData = set(
          {},
          'data.result.employmentsList.0.teamOrgUnit',
          null,
        );

        // @ts-expect-error enough for the test
        useFilterOrgUnitsByEmployees.mockReturnValue({
          isFetching: false,
          isFetched: true,
          data: orgUnitsData,
        });

        const { result } = renderHook(
          () => useGetOrgUnitByEmployeeId('employee-123'),
          {
            wrapper: ({ children }) => (
              <PrefContext source="Team">
                {/* @ts-expect-error enough for the test */}
                <DataSourceContext displayableHierarchy={{ getNode }}>
                  {children}
                </DataSourceContext>
              </PrefContext>
            ),
          },
        );

        expect(result.current).toEqual({
          node: undefined,
          isLoading: false,
          isFetched: true,
        });

        expect(getNode).not.toHaveBeenCalled();
      });
    });
  });
});
