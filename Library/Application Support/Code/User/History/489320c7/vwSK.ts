import { waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';
import * as goferClient from '@personio-web/gofer/src/client/client';
import { type AuthenticationClaim } from '@personio-web/auth-context';
import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';
import { ListOrgUnitMemberAvatarsHandlers } from '../../../handlers';
import { ListOrgUnitMemberAvatars } from '../../../queries';
import { useOrgUnitMemberAvatars } from '../useOrgUnitMemberAvatars';

const goferClientSpy = jest.spyOn(goferClient, 'goferRequest');

const mockAuthClaim: AuthenticationClaim = {
  companyId: 123,
  employeeId: 1,
  entityType: 'employee',
  userId: '3a107b7d-2188-4362-8fc1-6e14884df6c3',
  version: 3,
};

describe('useOrgUnitMemberAvatars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should batch and call goferClient request with correct parameters for multiple personIds', async () => {
    server.use(ListOrgUnitMemberAvatarsHandlers.defaultHandler);

    const firstPersonIds = ['person-1', 'person-2'];
    const secondPersonIds = ['person-3', 'person-4'];

    const { result } = renderHookWithWrapper(
      () => {
        useOrgUnitMemberAvatars(secondPersonIds);
        return useOrgUnitMemberAvatars(firstPersonIds);
      },
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(goferClientSpy).toHaveBeenCalledWith({
      operation: ListOrgUnitMemberAvatars,
      options: {
        companyId: mockAuthClaim.companyId,
        variables: {
          companyId: mockAuthClaim.companyId,
          personIds: ['person-3', 'person-4', 'person-1', 'person-2'],
        },
      },
    });
  });

  it('should not call goferClient request if personIds is undefined', async () => {
    const { result } = renderHookWithWrapper(
      () => useOrgUnitMemberAvatars(undefined),
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(goferClientSpy).not.toHaveBeenCalled();
  });
});
