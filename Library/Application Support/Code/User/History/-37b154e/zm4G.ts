import { createParamHandlers } from '@personio-web/payroll-util-navigation';

// List of relevant navigation params for type safety
const params = ['legalEntityId'] as const;

export const { getParams, setParam } = createParamHandlers(params);
export {
  createUrl,
  commitNavigation,
} from '@personio-web/payroll-util-navigation';
