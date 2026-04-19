import { useEffect } from 'react';
import type { AxiosError } from '@personio-web/request';
import { useListPermissions } from '@personio-web/payroll-data-payroll-me';
import { type ListPermissionsData } from '@personio-web/payroll-data-payroll-me-types';
import { listPermissionsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from '../temporary/useWrapQuery';

type PermittedActions =
  ListPermissionsData['legalEntityResourceActions'][number]['resourceTypeActions'];
type Resource = PermittedActions[number]['resourceType'];
type Actions = PermittedActions[number]['permittedActions'];
type UsePermissionResult = {
  isLoading: boolean;
  permittedActions: PermittedActions;
  getActionRights: (resource: Resource) => Actions;
};

const getPermittedActions = (
  permissionData?: ListPermissionsData,
  legalEntityId?: string,
) =>
  permissionData?.legalEntityResourceActions.find(
    (actions) => actions.legalEntityId === legalEntityId,
  )?.resourceTypeActions ?? [];

type ServerError = { detail?: string; errors?: { title: string }[] };
const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Error in fetching permissions',
    description:
      error.response?.data.errors?.[0].title ?? error.response?.data.detail,
    showCloseButton: true,
  });
};

export const usePermission = (
  legalEntityId: string | undefined,
): UsePermissionResult => {
  const { mutateAsync, isLoading, data } = useWrapMutation(
    useListPermissions,
    listPermissionsAPI,
  );
  const defaultHeaders = useGetDefaultHeaders();
  const permittedActions = getPermittedActions(data, legalEntityId);

  useEffect(() => {
    if (!legalEntityId) return;
    mutateAsync({
      requestBody: {
        legalEntityResourceTypes: [{ legalEntityId, resourceTypes: ['ALL'] }],
      },
      requestHeaders: defaultHeaders,
    }).catch(handleError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legalEntityId]);

  return {
    isLoading,
    permittedActions,
    getActionRights: (resource) =>
      permittedActions.find((e) => e.resourceType === resource)
        ?.permittedActions ?? [],
  };
};
