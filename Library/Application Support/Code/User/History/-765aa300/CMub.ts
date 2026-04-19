import { useListEmployerCompensationSchemas } from '@personio-web/payroll-data-payroll-me';
import { listEmployerCompensationSchemasAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useEmployerCompensationSchemas(legalEntityId: string) {
  const {
    data: compensationSchemas,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListEmployerCompensationSchemas,
    listEmployerCompensationSchemasAPI,
  )({ requestQuery: { legalEntityId } });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching compensation schemes',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { compensationTypes: compensationSchemas, isFetching, isError, error };
}
