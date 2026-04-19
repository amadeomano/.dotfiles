import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useCreatePayrollRunOnPayGroupChange = () => {
  const { asPath, query } = useRouter();

  useEffect(() => {}, [asPath]);
};
