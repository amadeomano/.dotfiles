import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useCreatePayrollRunOnPayPeriodChange = () => {
  const { asPath, query } = useRouter();

  useEffect(() => {
    const { payGroup } = query;
  }, [asPath]);
};
