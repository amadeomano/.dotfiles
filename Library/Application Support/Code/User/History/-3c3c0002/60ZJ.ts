import {
  useListCompensations,
  useGetCompensationTypes,
} from '@personio-web/payroll-data-payroll-me';
import {
  listCompensationsAPI,
  getCompensationTypesAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useCompensationTypes() {
  const {
    data: compensationTypes,
    isFetching,
    isError,
    error,
  } = useWrapQuery(useListCompensations, listCompensationsAPI)({});

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching pension schemas',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { pensionSchemes, isFetching, isError, error };
}
