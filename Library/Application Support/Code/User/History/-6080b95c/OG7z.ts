import { useCreatePayrollRun } from '@personio-web/payroll-data-payroll-me';
import { createPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { toaster } from 'designSystem/component/toaster';
import { useCallback, useEffect } from 'react';
import { useCurrentPayrollGroup } from '../data/useCurrentPayrollGroup';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from './temporary/useWrapQuery';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';

export const usePayrollGbPeriodNavigator = () => {
  const {
    updateURLWithPayrollData,
    period: currentPeriod,
    legalEntityId,
  } = useGbNavigation();
  const defaultHeaders = useGetDefaultHeaders();

  const { group, isPayGroupsFetched } = useCurrentPayrollGroup(legalEntityId);
  const {
    run: currentPayRun,
    isFetched: isRunsFetched,
    refetch: refetchRuns,
  } = useCurrentPayrollRun();

  const { mutate: mutateCreateRun } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
  );

  const onSelectPeriod = (period: number) => {
    updateURLWithPayrollData({ period });
  };

  const createRun = useCallback(
    (payGroupId: string, payDate: string) => {
      mutateCreateRun(
        {
          requestBody: {
            payGroupId,
            payDate,
          },
          requestHeaders: defaultHeaders,
        },
        {
          onSuccess(d: unknown) {
            console.info('Created pay run', { d });
            refetchRuns();
            toaster.notify({
              variant: 'success',
              title: 'New payroll run opened',
              showCloseButton: true,
            });
          },
          onError() {
            console.error('Error running pay run mutator');
            toaster.notify({
              variant: 'error',
              title: 'Problem opening new payroll run',
              showCloseButton: true,
            });
          },
        },
      );
    },
    [mutateCreateRun, refetchRuns],
  );

  const nextPeriod = group?.currentPeriod;
  if (!currentPeriod && nextPeriod) {
    updateURLWithPayrollData({ period: nextPeriod });
  }

  const groupPayPeriod = group?.payPeriods?.find(
    (p) => p.periodNumber === currentPeriod,
  );

  const groupId = group?.id;
  useEffect(() => {
    if (!isPayGroupsFetched || !isRunsFetched || !groupPayPeriod?.payDate) {
      return;
    }

    if (!currentPayRun?.id && groupId) {
      createRun(groupId, groupPayPeriod.payDate);
      return;
    }
  }, [
    isPayGroupsFetched,
    isRunsFetched,
    groupPayPeriod?.payDate,
    currentPayRun?.id,
    groupId,
    createRun,
  ]);

  if (!group || !currentPeriod || !groupPayPeriod) {
    return {
      status: 'loading' as const,
      periodNavigator: null,
    };
  }

  // Commenting the auto-call out:
  // Both compensation schemes and compensation scheme mappings must be created in order to create a pay run
  //
  // if (isRunsFetched && !currentPayRun && group.id) {
  //   if (!createRunFailed) {
  //     console.log({ createRunFailed });
  //     createRun(group.id, groupPayPeriod.payDate);
  //     return {
  //       status: 'loading' as const,
  //       periodNavigator: null,
  //     };
  //   }
  // }

  const periodStart = groupPayPeriod.startDate as string;
  const periodEnd = groupPayPeriod.endDate as string;

  return {
    status: 'success' as const,
    periodNavigator: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentPeriod: periodStart, // TODO: Navigator must support freetext
      onForward: () =>
        onSelectPeriod(
          Math.min(
            Math.max(...group.payPeriods.map((p) => p.periodNumber)),
            currentPeriod + 1,
          ),
        ),
      onBack: () => onSelectPeriod(Math.max(1, currentPeriod - 1)),
      onSelect: (value: Date) => onSelectPeriod(value as unknown as number),
      periodStart,
      periodEnd,
    },
  };
};
