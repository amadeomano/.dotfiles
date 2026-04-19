import { useEffect } from 'react';
import type { UseMutateAsyncFunction } from 'react-query';
import { useCreatePayrollRun } from '@personio-web/payroll-data-payroll-me';
import { createPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import type { CreatePayrollRunData } from '@personio-web/payroll-data-payroll-me-types';
import { useWrapMutation } from './temporary/useWrapQuery';
import { useCurrentPayrollGroup } from '../data/useCurrentPayrollGroup';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';

type Mutator = ReturnType<typeof useCreatePayrollRun>['mutateAsync'];

export const useCreatePayrollRunOnPayPeriodChange = () => {
  const { groupId: payGroupId, period } = useGbNavigation();
  const { group } = useCurrentPayrollGroup();
  const { mutateAsync } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
  );

  useEffect(() => {
    console.log('FINDING', period, payGroupId, group);
    const payDate = group?.payPeriods.find(
      ({ periodNumber }) => periodNumber === period,
    )?.payDate;

    if (!period || !payGroupId || !payDate) return;

    mutateAsync({ requestBody: { payGroupId, payDate } })
      .then((p) => console.log('DONE', p))
      .catch((e) => console.error('ISSUE', e));

    console.log('CHANGE Period: %s, GroupId: %s', period, payGroupId);
  }, [period, payGroupId, group]);
};
