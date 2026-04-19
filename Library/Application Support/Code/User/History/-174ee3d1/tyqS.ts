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
  getResourceActionRights: (resource: Resource) => Actions;
};

const setPermittedActions =
  ({ legalEntityResourceActions }: ListPermissionsData) => {
    result.permittedActions =
      legalEntityResourceActions.find(
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
  const result: UsePermissionResult = {
    isLoading,
    permittedActions:
      data?.legalEntityResourceActions.find(
        (actions) => actions.legalEntityId === legalEntityId,
      )?.resourceTypeActions ?? [],
    getResourceActionRights(this: UsePermissionResult, resource) {
      return (
        this.permittedActions.find((e) => e.resourceType === resource)
          ?.permittedActions ?? []
      );
    },
  };

  useEffect(() => {
    if (!legalEntityId) return;
    mutateAsync({
      requestBody: {
        legalEntityResourceTypes: [{ legalEntityId, resourceTypes: ['ALL'] }],
      },
      requestHeaders: defaultHeaders,
    }).catch(handleError);
  }, [legalEntityId]);

  return result;
};
