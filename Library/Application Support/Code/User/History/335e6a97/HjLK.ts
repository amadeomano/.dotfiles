import { useListPayGroups } from '@personio-web/payroll-data-payroll-me';
import { listPayGroupsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type ListPayGroupsData } from '@personio-web/payroll-data-payroll-me-types';
import { toaster } from 'designSystem/component/toaster';
import { useGetDefaultHeaders, useWrapQuery } from '../temporary/useWrapQuery';
import { useGbNavigation } from '../usePayrollGbBreadcrumbsNavigation';

export type PayGroup = ListPayGroupsData['data'][number];

type Opt<T> = { id: T; value: string };
type FrequencyOptions = { [Freq in PayGroup['frequency']]: Opt<Freq> };
const frequencies: FrequencyOptions = {
  MONTHLY: { id: 'MONTHLY', value: 'Monthly' },
  WEEKLY: { id: 'WEEKLY', value: 'Weekly' },
};
export const frequencyOptions = {
  getOption: (option: PayGroup['frequency']) => frequencies[option],
  getOptions: () => frequencies,
};

export function usePayGroups() {
  const defaultHeaders = useGetDefaultHeaders();
  const { legalEntityId } = useGbNavigation();
  const {
    data: payGroups,
    isFetching: isPayGroupsFetching,
    isError,
    error,
  } = useWrapQuery(
    useListPayGroups,
    listPayGroupsAPI,
  )({ requestHeaders: defaultHeaders, enabled: !!legalEntityId });

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Problem fetching payroll groups',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 5000,
    });
  }

  return { payGroups, isPayGroupsFetching, isError, error };
}
