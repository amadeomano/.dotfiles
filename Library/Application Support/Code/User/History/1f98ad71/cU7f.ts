import { useListPayGroups } from '@personio-web/payroll-data-payroll-me';
import { listPayGroupsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import {
  useGetDefaultHeaders,
  useWrapQuery,
} from '../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../hooks/usePayrollGbBreadcrumbsNavigation';

export function useCurrentPayrollGroup(legalEntityId: string | undefined) {
  const defaultHeaders = useGetDefaultHeaders();
  const {
    data: allGroups,
    isFetched,
    refetch,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListPayGroups,
    listPayGroupsAPI,
  )({ requestHeaders: defaultHeaders, enabled: !!legalEntityId });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching payroll groups',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  const leGroups =
    allGroups?.data?.filter((group) => group.legalEntityId === legalEntityId) ??
    [];

  return {
    // TODO: We only support single group for now
    group: leGroups.at(0),
    legalEntityGroups: leGroups,
    allGroups: allGroups?.data ?? [],
    refetch,
    isFetched,
    isFetching,
  };
}
