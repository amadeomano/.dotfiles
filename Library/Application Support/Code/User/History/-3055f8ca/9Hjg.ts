import { useRetrieveBacsFileForPayrollRun } from '@personio-web/payroll-data-payroll-me';
import { retrieveBacsFileForPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import { useWrapQuery } from '../hooks/temporary/useWrapQuery';
import { useCurrentPayrollRun } from './useCurrentPayrollRun';

export function useCurrentPayrollRunBacs() {
  const { run } = useCurrentPayrollRun();

  const {
    data: allGroups,
    isFetched,
    refetch,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useCurrentPayrollRunBacs,
    retrieveBacsFileForPayrollRunAPI,
  )({});

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching Bacs',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return {
    group: leGroups.at(0),
    legalEntityGroups: leGroups,
    allGroups: allGroups?.data ?? [],
    refetch,
    isFetched,
    isFetching,
  };
}
