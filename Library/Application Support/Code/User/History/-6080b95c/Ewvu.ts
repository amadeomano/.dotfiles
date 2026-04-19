import { useWrapMutation } from './temporary/useWrapQuery';
import { useCreatePayrollRun } from '@personio-web/payroll-data-payroll-me';
import { createPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';
import { useCurrentPayrollGroup } from '../data/useCurrentPayrollGroup';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';
import { useCallback, useState } from 'react';

export const usePayrollGbPeriodNavigator = () => {
  // const { period, legalEntity,  payrollGroup } = router.query;

  const { updateURLWithPayrollData, period: periodInUrl } = useGbNavigation();
  const [createRunFailed, setCreateRunFailed] = useState(false);

  const { group, allGroups } = useCurrentPayrollGroup();
  const {
    allRunsInGroup,
    run: currentPayRun,
    isFetched: isRunsFetched,
    refetch: refetchRuns,
  } = useCurrentPayrollRun();
  console.log('GROUP', { group, allGroups, allRunsInGroup });

  const { mutate: mutateCreateRun } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
  );

  const createRun = useCallback(
    (payGroupId: number, payDate: string) => {
      console.log('CreateRun', {
        payGroupId,
        payDate,
        createRunFailed,
      });
      setCreateRunFailed(true);
      mutateCreateRun(
        {
          requestBody: {
            payGroupId,
            payDate,
          },
        },
        {
          onSuccess(d: unknown) {
            console.info('Created pay run', { d });
            setCreateRunFailed(false);
            refetchRuns();
          },
          onError() {
            console.error('Error running pay run mutator');
          },
        },
      );
    },
    [createRunFailed, mutateCreateRun, refetchRuns],
  );

  if (!group || !isRunsFetched) {
    return {
      status: 'loading' as const,
      periodNavigator: null,
    };
  }

  if (!periodInUrl) {
    const nextPeriod = group.currentPeriod;
    updateURLWithPayrollData({ period: nextPeriod });
    return {
      status: 'loading' as const,
      periodNavigator: null,
    };
  }

  const currentPeriod = periodInUrl;

  const onSelectPeriod = (period: number) => {
    console.log('PERIOD', period);
    updateURLWithPayrollData({ period });
  };

  const groupPayPeriod = group.payPeriods.find(
    (p) => p.periodNumber === currentPeriod,
  );

  if (!groupPayPeriod) {
    return {
      status: 'loading' as const,
      periodNavigator: null,
    };
  }

  if (isRunsFetched && !currentPayRun && group.id) {
    if (!createRunFailed) {
      console.log({ createRunFailed });
      createRun(group.id, groupPayPeriod.payDate);
      return {
        status: 'loading' as const,
        periodNavigator: null,
      };
    }
  }

  const periodStart = groupPayPeriod.startDate as string;
  const periodEnd = groupPayPeriod.endDate as string;

  return {
    status: 'success' as const,
    periodNavigator: {
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
