import { createParamHandlers } from '@personio-web/payroll-util-navigation';

// List of relevant navigation params for type safety
const params = ['legalEntityId', 'payGroup'] as const;

export const { getParams, setParam, deleteParam } = createParamHandlers(params);
export {
  createUrl,
  commitNavigation,
} from '@personio-web/payroll-util-navigation';
