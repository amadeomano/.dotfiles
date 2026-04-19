import { useListPayGroups } from '@personio-web/payroll-data-payroll-me';
import { listPayGroupsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type ListPayrollRunsData } from '@personio-web/payroll-data-payroll-me-types';
import { toaster } from 'designSystem/component/toaster';
import { useGetDefaultHeaders, useWrapQuery } from '../temporary/useWrapQuery';
import { useGbNavigation } from '../usePayrollGbBreadcrumbsNavigation';

export type PayrollRun = ListPayrollRunsData['data'][number];

export function usePayGroups() {
  const defaultHeaders = useGetDefaultHeaders();
  const { legalEntityId } = useGbNavigation();
  const {
    data: payGroups,
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

  return { payrollRuns, isFetching, isError, error };
}
