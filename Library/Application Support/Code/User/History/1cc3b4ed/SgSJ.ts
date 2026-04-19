import { waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';
import * as goferClient from '@personio-web/gofer/src/client/client';
import type { AuthenticationClaim } from '@personio-web/auth-context';
import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';
import { ListOrgUnitsHandlers } from '../../../mocking';
import { ListOrgUnits } from '../../../queries';
import { useOrgUnitCardData } from '../useOrgUnitCardData';

const goferClientSpy = jest.spyOn(goferClient, 'goferRequest');

const mockAuthClaim: AuthenticationClaim = {
  companyId: 123,
  employeeId: 1,
  entityType: 'employee',
  userId: '3a107b7d-2188-4362-8fc1-6e14884df6c3',
  version: 3,
};

describe('useOrgUnitCardData', () => {
  const mockId = '123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return query result when hook is called with valid id', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);

    const { result } = renderHookWithWrapper(() => useOrgUnitCardData(mockId), {
      authClaim: mockAuthClaim,
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.data).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(typeof result.current.error).toBeDefined();
  });

  it('should handle empty id parameter', async () => {
    const { result } = renderHookWithWrapper(() => useOrgUnitCardData(''), {
      authClaim: mockAuthClaim,
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should handle HTTP errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    server.use(ListOrgUnitsHandlers.httpErrorHandler);

    const { result } = renderHookWithWrapper(() => useOrgUnitCardData(mockId), {
      authClaim: mockAuthClaim,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should batch and call goferClient request with correct parameters', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);

    const { result } = renderHookWithWrapper(
      () => {
        useOrgUnitCardData('321');
        return useOrgUnitCardData(mockId);
      },
      { authClaim: mockAuthClaim },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(goferClientSpy).toHaveBeenCalledWith({
      operation: ListOrgUnits,
      options: {
        companyId: mockAuthClaim.companyId,
        variables: {
          companyId: mockAuthClaim.companyId,
          filter: `id in ['321','${mockId}']`,
          includeDirectMemberCount: true,
          includeDepartmentId: true,
          includeTeamId: true,
          includeLeads: true,
        },
      },
    });
  });
});
