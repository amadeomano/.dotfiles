import { createParamHandlers } from '@personio-web/payroll-util-navigation';

// List of relevant navigation params for type safety
const tableParams = [
  'sort',
  'person',
  'employeeNumber',
  'blockers',
  'office',
] as const;

export const {
  getParams: getTableParams,
  setParam: setTableParam,
  deleteParam: deleteTableParam,
} = createParamHandlers(tableParams);
export {
  createUrl,
  commitNavigation,
} from '@personio-web/payroll-util-navigation';
