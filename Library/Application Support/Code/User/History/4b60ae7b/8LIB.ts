import { useCreateEmployerPensionScheme as useListEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import { createEmployerPensionScheme1API as listEmployerPensionSchemeAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapMutation } from '../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function useEmployerPensionSchemes() {
  const {
    data: allRuns,
    isFetched,
    refetch,
    isFetching,
    isError,
    error,
  } = useWrapMutation(
    useListEmployerPensionScheme,
    listEmployerPensionSchemeAPI,
  );

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching runs',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  const allRunsInGroup = (allRuns as ListPayrollRunsData)?.data ?? [];
  const currentRun =
    allRunsInGroup.find((run) => run?.period === period) ?? undefined;
  return {
    run: currentRun,
    runIsApproved: currentRun?.status === 'APPROVED',
    allRunsInGroup,
    refetch,
    isFetched,
    isFetching,
  };
}
