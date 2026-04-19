import { useRouter } from 'next/router';
import { usePayrollContextData } from '@personio-web/payroll-data-payroll-integration-context';
import { getParams } from '../../../utils/navigationParams';

const DEFAULT_REDIRECT_LINK = 'https://go.xero.com';

const usePayRunRedirectLink = () => {
  const router = useRouter();
  const { legalEntityId } = getParams(router.query);
  const { data: context } = usePayrollContextData('xero', legalEntityId);

  return (
    context?.xeroContext?.redirectUrls.payRunOverview ?? DEFAULT_REDIRECT_LINK
  );
};

export default usePayRunRedirectLink;
