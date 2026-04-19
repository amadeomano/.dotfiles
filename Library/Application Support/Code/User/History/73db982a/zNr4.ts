import { createParamHandlers } from 'payroll/util/navigation';

const params = ['legalEntityId'] as const;

export const { getParams } = createParamHandlers(params);
