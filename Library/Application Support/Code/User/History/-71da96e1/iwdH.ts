import { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { FilterConfig } from '@personio-web/design-system-component-table-types';
import { personColumnConditions } from '../../../utils/filters/filterByPerson';
import { blockersColumnConditions } from '../../../utils/filters/filterByBlockers';
import { employeeCodeColumnConditions } from '../../../utils/filters/filterByEmployeeCode';
import { officeColumnConditions } from '../../../utils/filters/filterByOffice';

export const filtersConfig: FilterConfig<PeopleData>[] = [
  {
    columnId: 'person',
    field: 'text',
    conditions: personColumnConditions,
  },
  // {
  //   columnId: 'employeeCode',
  //   field: 'text',
  //   conditions: employeeCodeColumnConditions,
  // },
  {
    columnId: 'blockers',
    field: 'text',
    conditions: blockersColumnConditions,
  },
  {
    columnId: 'office',
    field: 'text',
    conditions: officeColumnConditions,
  },
];
