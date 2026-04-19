import { useListSchemaMappings } from '@personio-web/payroll-data-payroll-me';
import { listSchemaMappingsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useCompensationTypes(legalEntityId?: string) {
  const {
    data: schemaMappings,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListSchemaMappings,
    listSchemaMappingsAPI,
  )({
    requestQuery: { legalEntityId: legalEntityId ?? '' },
    enabled: Boolean(legalEntityId),
  });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching schema mappings',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { compensationTypes: schemaMappings, isFetching, isError, error };
}
