import { createParamHandlers } from 'payroll/util/navigation';

const params = ['legalEntityId'] as const;

export const { getParams, setParam } = createParamHandlers(params);
export { createUrl, commitNavigation } from 'payroll/util/navigation';
