import { useListCompensations } from '@personio-web/payroll-data-payroll-me';
import { listCompensationsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useCompensationTypes() {
  const {
    data: compensationTypes,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListCompensations,
    listCompensationsAPI,
  )({ requestQuery: {} });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching compensation types',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { compensationTypes, isFetching, isError, error };
}
