import { createParamHandlers } from '@personio-web/payroll-util-navigation';

const params = ['legalEntityId', 'payGroup'] as const;

export const { getParams: getPageParams } = createParamHandlers(params);
export {
  createUrl,
  commitNavigation,
} from '@personio-web/payroll-util-navigation';
