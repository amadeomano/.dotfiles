import { useListPayGroups } from '@personio-web/payroll-data-payroll-me';
import { listPayGroupsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import { useWrapQuery } from '../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../hooks/usePayrollGbBreadcrumbsNavigation';
import { useCurrentPayrollRun } from './useCurrentPayrollRun';

export function useCurrentPayrollGroup() {
  const { run } = useCurrentPayrollRun();
  const { legalEntityId } = useGbNavigation();

  const {
    data: allGroups,
    isFetched,
    refetch,
    isFetching,
    isError,
    error,
  } = useWrapQuery(useListPayGroups, listPayGroupsAPI)({});

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
    group: leGroups.at(0),
    legalEntityGroups: leGroups,
    allGroups: allGroups?.data ?? [],
    refetch,
    isFetched,
    isFetching,
  };
}
