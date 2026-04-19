import { useEffect } from 'react';
import { useFetchLegalEntityOnboardingData } from '@personio-web/payroll-data-payroll-me';
import { fetchLegalEntityOnboardingDataAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type FetchLegalEntityOnboardingDataData } from '@personio-web/payroll-data-payroll-me-types';
import { useGetDefaultHeaders, useWrapQuery } from './temporary/useWrapQuery';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';

export type Status = FetchLegalEntityOnboardingDataData['status'] | undefined;

export const useParallelMode = () => {
  const { legalEntityId = '' } = useGbNavigation();
  const defaultHeaders = useGetDefaultHeaders();
  const { data, refetch } = useWrapQuery(
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

  const mode: Mode = data?.mode;
  const status: Status = data?.status;

  return { mode, status };
};
