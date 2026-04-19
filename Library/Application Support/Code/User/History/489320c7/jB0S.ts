import { waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';
import * as goferClient from '@personio-web/gofer/src/client/client';
import { type AuthenticationClaim } from '@personio-web/auth-context';
import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';
import { ListOrgUnitMemberAvatarsHandlers } from '../../../handlers';
import { createListOrgUnitMemberAvatarsHandler } from '../../../handlers/generated/ListOrgUnitMemberAvatarsHandlers';
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

  it('should filter results via inclusion filter and return only requested personIds', async () => {
    const firstPersonIds = ['person-1', 'person-2'];
    const secondPersonIds = ['person-3', 'person-4'];

    // Create a custom handler that returns mock data for all persons
    const customHandler = createListOrgUnitMemberAvatarsHandler(() => ({
      data: {
        membersData: {
          personsList: [
            { id: 'person-1', preferredName: { value: 'Person 1' } },
            { id: 'person-2', preferredName: { value: 'Person 2' } },
            { id: 'person-3', preferredName: { value: 'Person 3' } },
            { id: 'person-4', preferredName: { value: 'Person 4' } },
          ],
        },
      },
    }));

    server.use(customHandler);

    const { result } = renderHookWithWrapper(
      () => {
        const firstHook = useOrgUnitMemberAvatars(firstPersonIds);
        const secondHook = useOrgUnitMemberAvatars(secondPersonIds);
        return { firstHook, secondHook };
      },
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.firstHook.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.secondHook.isLoading).toBe(false);
    });

    // First hook should only receive data for person-1 and person-2
    expect(result.current.firstHook.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'person-1' }),
        expect.objectContaining({ id: 'person-2' }),
      ]),
    );
    expect(result.current.firstHook.data).toHaveLength(2);

    // Second hook should only receive data for person-3 and person-4
    expect(result.current.secondHook.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'person-3' }),
        expect.objectContaining({ id: 'person-4' }),
      ]),
    );
    expect(result.current.secondHook.data).toHaveLength(2);
  });
});
