import { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { FilterConfig } from '@personio-web/design-system-component-table-types';
import { personColumnConditions } from '../../../utils/filters/filterByPerson';
import { blockersColumnConditions } from '../../../utils/filters/filterByBlockers';

export const filtersConfig: FilterConfig<PeopleData>[] = [
  {
    columnId: 'person',
    field: 'text',
    conditions: personColumnConditions,
  },
  {
    columnId: 'employeeCode',
    field: 'text',
    conditions: employeeNumberColumnConditions,
  },
  {
    columnId: 'blockers',
    field: 'text',
    conditions: blockersColumnConditions,
  },
];
