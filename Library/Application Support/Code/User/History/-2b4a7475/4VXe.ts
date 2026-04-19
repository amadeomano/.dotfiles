import { useListEmployeePensions } from '@personio-web/payroll-data-payroll-me';
import { listEmployeePensionsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useEmployeePensions(employeeId: number) {
  const {
    data: employeePensions,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListEmployeePensions,
    listEmployeePensionsAPI,
  )({ requestPathParams: { employeeId } });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching pension schemas',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { pensionSchemes: employeePensions, isFetching, isError, error };
}
