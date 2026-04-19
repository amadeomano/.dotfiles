import { useListPayrollRuns } from '@personio-web/payroll-data-payroll-me';
import { type ListPayrollRunsData } from '@personio-web/payroll-data-payroll-me-types';
import { listPayrollRunsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import { useGetDefaultHeaders, useWrapQuery } from '../temporary/useWrapQuery';
import { useGbNavigation } from '../usePayrollGbBreadcrumbsNavigation';

export type PayrollRun = ListPayrollRunsData['data'][number];

export function usePayrollRuns() {
  const defaultHeaders = useGetDefaultHeaders();
  const { groupId: payGroupId = '' } = useGbNavigation();
  const {
    data: payrollRuns,
    isFetching: isPayRunsFetching,
    isError,
    error,
  } = useWrapQuery(
    useListPayrollRuns,
    listPayrollRunsAPI,
  )({
    requestHeaders: defaultHeaders,
    requestQuery: { payGroupId },
    enabled: Boolean(payGroupId),
  });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching pension schemas',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { payrollRuns, isPayRunsFetching, isError, error };
}
