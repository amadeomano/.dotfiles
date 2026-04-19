import { createParamHandlers } from 'payroll/utils/navigation';

const params = ['legalEntityId'] as const;

export const { getParams } = createParamHandlers(params);
