import { setupServer } from 'msw/node';
import { getEmployeeProfileHandlers } from '@personio-web/payroll-data-preliminary-payroll/src/handlers';

export const server = setupServer([getEmployeeProfileHandlers.defaultHandler]);
