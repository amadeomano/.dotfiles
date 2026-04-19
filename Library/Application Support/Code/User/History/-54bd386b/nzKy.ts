import { createParamHandlers } from '@personio-web/payroll-util-navigation';

// List of relevant navigation params for type safety
const tableParams = [
  'sort',
  'person',
  'employeeNumber',
  'blockers',
  'salaryType',
  'grossPay',
] as const;

const pageParams = ['legalEntityId'] as const;

export const {
  getParams: getTableParams,
  setParam: setTableParam,
  deleteParam: deleteTableParam,
} = createParamHandlers(tableParams);
export const { getParams: getPageParams } = createParamHandlers(pageParams);
export {
  createUrl,
  commitNavigation,
} from '@personio-web/payroll-util-navigation';
