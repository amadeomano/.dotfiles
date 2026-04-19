import { useCreateEmployerPensionScheme1 as useListEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import { createEmployerPensionScheme1API as listEmployerPensionSchemeAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapQuery } from '../../../hooks/temporary/useWrapQuery';
import { toaster } from 'designSystem/component/toaster';

export function usePensionSchemeContributionGroups() {
  const {
    data: contributionGroups,
    isFetching,
    isError,
    error,
  } = useWrapQuery(
    useListEmployerPensionScheme,
    listEmployerPensionSchemeAPI,
  )({});

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching contribution groups',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { contributionGroups, isFetching, isError, error };
}
