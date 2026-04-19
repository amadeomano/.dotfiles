import { useListPayGroups } from '@personio-web/payroll-data-payroll-me';
import { listPayGroupsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type ListPayGroupsData } from '@personio-web/payroll-data-payroll-me-types';
import { toaster } from 'designSystem/component/toaster';
import { useGetDefaultHeaders, useWrapQuery } from '../temporary/useWrapQuery';
import { useGbNavigation } from '../usePayrollGbBreadcrumbsNavigation';

export type PayGroup = ListPayGroupsData['data'][number];

export function usePayGroups() {
  const defaultHeaders = useGetDefaultHeaders();
  const { legalEntityId } = useGbNavigation();
  const {
    data: payGroups,
    isFetching: isPayGroupsFetching,
    isFetched: isPayGroupsFetched,
    isError: isPayGroupsError,
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

  return {
    payGroups,
    isPayGroupsFetching,
    isPayGroupsFetched,
    isPayGroupsError,
    error,
  };
}

type Opt<T> = { id: T; value: string };
type FrequencyOptions = { [Freq in PayGroup['frequency']]: Opt<Freq> };
const frequencies: FrequencyOptions = {
  MONTHLY: { id: 'MONTHLY', value: 'Monthly' },
  WEEKLY: { id: 'WEEKLY', value: 'Weekly' },
};
export const frequencyOptions = {
  getOption: (option?: PayGroup['frequency']): Opt<string> =>
    option && option in frequencies
      ? frequencies[option]
      : { id: '', value: '' },
  getOptions: () => Object.values(frequencies),
};

export const getPayGroupById = (payGroups: PayGroup[], payGroupId: string) =>
  payGroups.find(({ id }) => id === payGroupId);

export const getPayGroupScheduleName = (group?: PayGroup) =>
  frequencyOptions.getOption(group?.frequency).value;
