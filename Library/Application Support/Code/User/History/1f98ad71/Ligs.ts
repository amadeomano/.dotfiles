import { useListPayGroups } from '@personio-web/payroll-data-payroll-me';
import type { ListPayGroupsBody } from '@personio-web/payroll-data-payroll-me-types';
import { listPayGroupsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import { useWrapQuery } from '../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../hooks/usePayrollGbBreadcrumbsNavigation';

export const getPayPeriod = (
  periodId: number,
  group: ListPayGroupsBody['data'][number],
): ListPayGroupsBody['data'][number]['payPeriods'][number] | undefined =>
  group.payPeriods?.find((period) => period.id === periodId);

export function useCurrentPayrollGroup() {
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
    // TODO: We only support single group for now
    group: leGroups.at(0),
    legalEntityGroups: leGroups,
    allGroups: allGroups?.data ?? [],
    refetch,
    isFetched,
    isFetching,
  };
}
