import {useRouter} from 'next/router';
import { useEffect } from 'react';

export const useCreatePayrollRunOnPayGroupChange = () => {
  const router = useRouter();

  useEffect(()