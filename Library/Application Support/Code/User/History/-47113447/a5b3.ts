import { waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';
import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';
import * as gofer from '@personio-web/employees-organizations-gofer';
import { ListOrgUnitMembersCustomHandlers } from '@personio-web/employees-organizations-gofer/mocking';

import { type OrgUnitResult } from '../../types';
import { MEMBERS_LIST_PAGE_SIZE, useListMembers } from './useListMembers';

const useListOrgUnitMembers = jest.spyOn(
  gofer,
  'useInfiniteListOrgUnitMembers',
);

const createOrgUnitMock = (
  overrides: Partial<OrgUnitResult> = {},
): OrgUnitResult =>
  ({
    type: 'ORG_UNIT_TYPE_TEAM',
    teamId: { __typename: 'protocore_hrteamid_TeamId_v1', id: 'team-123' },
    ...overrides,
  } as OrgUnitResult);

type Data = ReturnType<typeof useListMembers>['data'];
const getMembers = (data: Data) =>
  data?.pages.flatMap((page) => page.data?.membersData?.employmentsList);

describe('useListMembers', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('should successfully fetch and return members list for a team org unit', async () => {
    server.use(ListOrgUnitMembersCustomHandlers.defaultHandler);

    const teamOrgUnit = createOrgUnitMock();

    const { result } = renderHookWithWrapper(() =>
      useListMembers({
        orgUnit: teamOrgUnit,
        enabled: true,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(useListOrgUnitMembers).toHaveBeenCalledWith({
      variables: {
        companyId: 123,
        filter: 'team.id == "team-123" && status == "ACTIVE"',
        orderBy: 'person.preferred_name',
        pageSize: MEMBERS_LIST_PAGE_SIZE,
      },
      queryOptions: { enabled: true },
    });

    expect(result.current.data).toBeDefined();
    const members = getMembers(result.current.data);
    expect(members).toHaveLength(2);
  });

  it('should successfully fetch and return members list for a department org unit', async () => {
    server.use(ListOrgUnitMembersCustomHandlers.defaultHandler);

    const departmentOrgUnit = createOrgUnitMock({
      type: 'ORG_UNIT_TYPE_DEPARTMENT',
      departmentId: {
        __typename: 'protocore_hrdepartmentid_DepartmentId_v1',
        id: 'department-456',
      },
    });

    const { result } = renderHookWithWrapper(() =>
      useListMembers({
        orgUnit: departmentOrgUnit,
        enabled: true,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(useListOrgUnitMembers).toHaveBeenCalledWith({
      variables: {
        companyId: 123,
        filter: 'department.id == "department-456"',
        orderBy: 'person.preferred_name',
        pageSize: MEMBERS_LIST_PAGE_SIZE,
      },
      queryOptions: { enabled: true },
    });

    expect(result.current.data).toBeDefined();
    const members = getMembers(result.current.data);
    expect(members).toHaveLength(2);
  });

  it('should not execute query when enabled is false', async () => {
    const teamOrgUnit = createOrgUnitMock();

    const { result } = renderHookWithWrapper(() =>
      useListMembers({
        orgUnit: teamOrgUnit,
        enabled: false,
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should not execute query when orgUnit is undefined', async () => {
    const { result } = renderHookWithWrapper(() =>
      useListMembers({
        orgUnit: undefined,
        enabled: true,
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});
