import { createParamHandlers } from '@personio-web/payroll-util-navigation';

// List of relevant navigation params for type safety
const tableParams = [
  'sort',
  'personFilter',
  'employeeNumberFilter',
  'blockersFilter',
  'salaryTypeFilter',
  'grossPayFilter',
] as const;

export const {
  getParams: getTableParams,
  setParam: setTableParam,
  deleteParam,
} = createParamHandlers(tableParams);
export { createUrl } from '@personio-web/payroll-util-navigation';
