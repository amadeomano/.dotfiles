import { useRouter } from 'next/router';
import { getParams } from '../utils/navigationParams';

export const useActiveLegalEntityId = (): string => {
  const {
    params: { legalEntityId },
  } = usePayrollIntegrationSettingsNavigator('a3');

  // The wrapping Payroll Integration Settings mFE makes sure that there's always a legalEntityId in the search params
  // thus we can assume that it will always be defined
  return legalEntityId!;
};
