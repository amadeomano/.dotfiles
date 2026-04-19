import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useWrapMutation } from './temporary/useWrapQuery';
import { useCreatePayrollRun } from '@personio-web/payroll-data-payroll-me';
import { createPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';

export const useCreatePayrollRunOnPayPeriodChange = () => {
  const { asPath, query } = useRouter();
  const { mutate: mutateCreateRun } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
  );

  useEffect(() => {
    const { payGroup } = query;
  }, [asPath]);
};
