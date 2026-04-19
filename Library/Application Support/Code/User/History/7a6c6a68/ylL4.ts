import { useEffect } from 'react';
import { useWrapMutation } from './temporary/useWrapQuery';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';
import { useCreatePayrollRun } from '@personio-web/payroll-data-payroll-me';
import { createPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';

export const useCreatePayrollRunOnPayPeriodChange = () => {
  const { groupId, period } = useGbNavigation();
  const { mutateAsync } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
  );

  useEffect(() => {
    console.log('period changed');
  }, [query.period]);
};
