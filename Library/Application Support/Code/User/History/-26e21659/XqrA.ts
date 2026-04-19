import { XeroPeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { FilterConfig } from '@personio-web/design-system-component-table-types';
import { personColumnConditions } from '../../../utils/filters/filterByPerson';
import { blockersColumnConditions } from '../../../utils/filters/filterByBlockers';
import { employeeNumberColumnConditions } from '../../../utils/filters/filterByEmployeeNumber';
import { salaryTypeColumnOptions } from '../../../utils/filters/filterBySalaryType';
import { grossSalaryColumnConditions } from '../../../utils/filters/filterByGrossSalary';

export const filtersConfig: FilterConfig<
  PeopleData & { salaryType: PeopleData['grossSalary']['type'] }
>[] = [
  {
    columnId: 'person',
    field: 'text',
    conditions: personColumnConditions,
  },
  {
    columnId: 'employeeNumber',
    field: 'text',
    conditions: employeeNumberColumnConditions,
  },
  {
    columnId: 'blockers',
    field: 'text',
    conditions: blockersColumnConditions,
  },
  ,
  /* {
    columnId: 'salaryType',
    field: 'multiselect',
    conditions: ['contains'],
    options: salaryTypeColumnOptions,
  } */ {
    columnId: 'grossSalary',
    field: 'text',
    conditions: grossSalaryColumnConditions,
  },
];
