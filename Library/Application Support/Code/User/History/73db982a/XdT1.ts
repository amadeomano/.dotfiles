// TODO: once the app is moved to NorthStar this import could be changed to
// @personio-web/payroll-util-navigation
import { createParamHandlers } from './navigation';

// List of relevant navigation params for type safety
const params = ['legalEntityId', 'payGroup'] as const;

export const { getParams } = createParamHandlers(params);
export { createUrl, commitNavigation } from './navigation';
