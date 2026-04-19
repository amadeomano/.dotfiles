import { useEffect } from 'react';
import { useFetchLegalEntityOnboardingData } from '@personio-web/payroll-data-payroll-me';
import { useGetDefaultHeaders, useWrapQuery } from './temporary/useWrapQuery';

const useParallelMode = () => {
  const defaultHeaders = useGetDefaultHeaders();
};
