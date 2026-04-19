import { useListPayrollRuns } from '@personio-web/payroll-data-payroll-me';
import { listPayrollRunsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import {
  getDefaultHeaders,
  useWrapQuery,
} from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function usePayrollRuns() {
  const defaultHeaders = getDefaultHeaders();
  const {
    data: payrollRuns,
    isFetching,
    isError,
    error,
  } = useWrapQuery(useListPayrollRuns, listPayrollRunsAPI)();

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
