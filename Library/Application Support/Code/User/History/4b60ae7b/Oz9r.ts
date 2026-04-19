import { useCreateEmployerPensionScheme as useListEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import { createEmployerPensionScheme1API as llistEmployerPensionSchemeAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';
import { ListPayrollRunsData } from '@personio-web/payroll-data-payroll-me';

export type PayrollRun = ListPayrollRunsData['data'][number];

export function useEmployerPensionSchemes() {
  const {
    data: allRuns,
    isFetched,
    refetch,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListPayrollRuns,
    listPayrollRunsAPI,
  )({ requestQuery: { payGroupId: Number(groupId) }, enabled: !!groupId });

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
