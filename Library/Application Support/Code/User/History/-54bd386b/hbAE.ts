import { createParamHandlers } from '@personio-web/payroll-util-navigation';

// List of relevant navigation params for type safety
const params = [
  'sort',
  'personFilter',
  'employeeNumberFilter',
  'blockersFilter',
  'salaryTypeFilter',
  'grossPayFilter',
] as const;

export const { getParams, setParam, deleteParam } = createParamHandlers(params);
export { createUrl } from '@personio-web/payroll-util-navigation';
