import { useCreateEmployerPensionScheme as useListEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import { createEmployerPensionScheme1API as listEmployerPensionSchemeAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapMutation } from '../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useEmployerPensionSchemes() {
  const {
    data: pensionSchemas,
    isLoadingm
    isError,
    error,
  } = useWrapMutation(
    useListEmployerPensionScheme,
    listEmployerPensionSchemeAPI,
  );

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching pension schemas',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return {
    run: currentRun,
    runIsApproved: currentRun?.status === 'APPROVED',
    allRunsInGroup,
    refetch,
    isFetched,
    isFetching,
  };
}
