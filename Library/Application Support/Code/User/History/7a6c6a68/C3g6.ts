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
  const { groupId, period } = useGbNavigation();
  const { mutateAsync } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
  );

  useEffect(() => {
    if (!groupId || !period) return;

    console.log('CHANGE Period: %s, GroupId: %s', period, groupId);
  }, [period, groupId]);
};
