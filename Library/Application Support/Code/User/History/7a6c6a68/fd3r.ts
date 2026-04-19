import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useCreatePayrollRunOnPayGroupChange = () => {
  const { asPath } = useRouter();

  useEffect(() => {}, [asPath]);
};
