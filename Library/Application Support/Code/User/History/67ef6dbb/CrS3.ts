import { useListPayrollRuns } from '@personio-web/payroll-data-payroll-me';
import { listPayrollRunsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import {
  getDefaultHeaders,
  useWrapQuery,
} from '../../../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../../../hooks/usePayrollGbBreadcrumbsNavigation';

export function usePayrollRuns() {
  const defaultHeaders = getDefaultHeaders();
  const { groupId } = useGbNavigation();
  const {
    data: payrollRuns,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListPayrollRuns,
    listPayrollRunsAPI,
  )({ requestHeaders: defaultHeaders, requestQuery });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching pension schemas',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { payrollRuns, isFetching, isError, error };
}
