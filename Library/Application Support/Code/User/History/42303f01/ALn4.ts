import { server } from '@personio-web/mocks/server';

import { waitFor } from '@testing-library/react';

import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';

import { GetOrgUnitHandlers } from '../../../handlers';
import { useGetOrgUnit } from '../../../hooks';
import {
  getOrgUnitMockDepartment,
  getOrgUnitMockDepartmentNoItemsAssigned,
  getOrgUnitMockDepartmentOnlyDirectDescendants,
  getOrgUnitMockWithAncestorIds,
  getOrgUnitMockWithParentId,
  GetOrgUnitQueryResponse,
} from '../../../mocks';

const ORG_UNIT_ID = '1';

describe('useListOrgUnits', () => {
  it('should get an org unit', async () => {
    server.use(GetOrgUnitHandlers.defaultHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: '5112' },
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      ...GetOrgUnitQueryResponse,
      errors: undefined,
    });
  });

  it('should handle defaultDepartmentHandler', async () => {
    server.use(GetOrgUnitHandlers.defaultDepartmentHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      data: {
        orgUnit: getOrgUnitMockDepartment,
      },
      errors: undefined,
    });
  });

  it('should handle withParentIdHandler', async () => {
    server.use(GetOrgUnitHandlers.withParentIdHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      data: {
        orgUnit: getOrgUnitMockWithParentId,
      },
      errors: undefined,
    });
  });

  it('should handle withAncestorIdsHandler', async () => {
    server.use(GetOrgUnitHandlers.withAncestorIdsHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      data: {
        orgUnit: getOrgUnitMockWithAncestorIds,
      },
      errors: undefined,
    });
  });

  it('should handle withNoItemsAssignedHandler', async () => {
    server.use(GetOrgUnitHandlers.withNoItemsAssignedHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      data: {
        orgUnit: getOrgUnitMockDepartmentNoItemsAssigned,
      },
      errors: undefined,
    });
  });

  it('should handle withOnlyDirectDescendantsHandler', async () => {
    server.use(GetOrgUnitHandlers.withOnlyDirectDescendantsHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      data: {
        orgUnit: getOrgUnitMockDepartmentOnlyDirectDescendants,
      },
      errors: undefined,
    });
  });

  it('should handle notFoundHandler', async () => {
    server.use(GetOrgUnitHandlers.notFoundHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isError).toBeTrue();
    });

    expect((result.current.error as any)?.response?.status).toBe(404);
  });

  it('should handle unauthorizedHandler', async () => {
    server.use(GetOrgUnitHandlers.unauthorizedHandler);

    const { result } = renderHookWithWrapper(() =>
      useGetOrgUnit({
        variables: { id: ORG_UNIT_ID },
      }),
    );

    await waitFor(() => {
      expect(result.current.isError).toBeTrue();
    });

    expect((result.current.error as any)?.response?.status).toBe(401);
  });
});
