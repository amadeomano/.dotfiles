import { useEffect } from 'react';
import { useFetchLegalEntityOnboardingData } from '@personio-web/payroll-data-payroll-me';
import { fetchLegalEntityOnboardingDataAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type FetchLegalEntityOnboardingDataData } from '@personio-web/payroll-data-payroll-me-types';
import { useGetDefaultHeaders, useWrapQuery } from './temporary/useWrapQuery';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';
import { toaster } from 'designSystem/component/toaster';

export type Mode = FetchLegalEntityOnboardingDataData['mode'] | undefined;
export type Status = FetchLegalEntityOnboardingDataData['status'] | undefined;

export const useParallelMode = () => {
  const { legalEntityId = '' } = useGbNavigation();
  const defaultHeaders = useGetDefaultHeaders();
  const { data, refetch, error } = useWrapQuery(
    useFetchLegalEntityOnboardingData,
    fetchLegalEntityOnboardingDataAPI,
  )({
    requestHeaders: defaultHeaders,
    requestPathParams: { legalEntityId },
    enabled: false,
  });

  useEffect(() => {
    if (!legalEntityId) return;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legalEntityId]);

  if (error)
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching parallel mode status',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });

  const mode: Mode = data?.mode;
  const status: Status = data?.status;

  return { mode, status };
};
