import { waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';
import * as goferClient from '@personio-web/gofer/src/client/client';
import { type AuthenticationClaim } from '@personio-web/auth-context';
import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';
import { ListOrgUnitAllMemberIdsHandlers } from '../../../handlers';
import { ListOrgUnitAllMemberIds } from '../../../queries';
import { useOrgUnitFirstMemberIds } from '../useOrgUnitFirstMemberIds';

const goferClientSpy = jest.spyOn(goferClient, 'goferRequest');

const mockAuthClaim: AuthenticationClaim = {
  companyId: 123,
  employeeId: 1,
  entityType: 'employee',
  userId: '3a107b7d-2188-4362-8fc1-6e14884df6c3',
  version: 3,
};

const mockOrgUnit = {
  id: { id: '123' },
  name: 'Test Org Unit',
  description: 'Test description',
  resourceUri: 'https://example.com',
  type: 'ORG_UNIT_TYPE_DEPARTMENT' as const,
  parentId: { id: '1' },
  parent: {
    departmentId: {
      id: 'parent-dept-1',
      __typename: 'protocore_hrdepartmentid_DepartmentId_v1' as const,
    },
    teamId: null,
  },
  abbreviation: 'TD',
  departmentId: {
    id: 'dept-123',
    __typename: 'protocore_hrdepartmentid_DepartmentId_v1' as const,
  },
  teamId: null,
  layerLevel: 1,
  layerLabelsList: [],
};

describe('useOrgUnitFirstMemberIds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should batch and call goferClient request with correct parameters for department orgUnit', async () => {
    server.use(ListOrgUnitAllMemberIdsHandlers.defaultHandler);

    const mockSecondOrgUnit = {
      ...mockOrgUnit,
      departmentId: {
        id: 'dept-321',
        __typename: 'protocore_hrdepartmentid_DepartmentId_v1' as const,
      },
    };

    const { result } = renderHookWithWrapper(
      () => {
        useOrgUnitFirstMemberIds(mockSecondOrgUnit);
        return useOrgUnitFirstMemberIds(mockOrgUnit);
      },
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(goferClientSpy).toHaveBeenCalledWith({
      operation: ListOrgUnitAllMemberIds,
      options: {
        companyId: mockAuthClaim.companyId,
        variables: {
          filter: `department.id in ['dept-321']`,
        },
      },
    });
  });

  it('should batch and call goferClient request with correct parameters for team orgUnit', async () => {
    server.use(ListOrgUnitAllMemberIdsHandlers.defaultHandler);

    const mockTeamOrgUnit = {
      ...mockOrgUnit,
      type: 'ORG_UNIT_TYPE_TEAM' as const,
      departmentId: null,
      teamId: {
        id: 'team-123',
        __typename: 'protocore_hrteamid_TeamId_v1' as const,
      },
    };

    const { result } = renderHookWithWrapper(
      () => useOrgUnitFirstMemberIds(mockTeamOrgUnit),
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(goferClientSpy).toHaveBeenCalledWith({
      operation: ListOrgUnitAllMemberIds,
      options: {
        companyId: mockAuthClaim.companyId,
        variables: {
          filter: `team.id in ['team-123']`,
        },
      },
    });
  });

  it('should not call goferClient request if orgUnit is ORG_UNIT_TYPE_UNSPECIFIED', async () => {
    const mockUnspecifiedOrgUnit = {
      ...mockOrgUnit,
      type: 'ORG_UNIT_TYPE_UNSPECIFIED' as const,
    };

    const { result } = renderHookWithWrapper(
      () => useOrgUnitFirstMemberIds(mockUnspecifiedOrgUnit),
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(goferClientSpy).not.toHaveBeenCalled();
  });
});
