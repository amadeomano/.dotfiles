import orderBy from 'lodash/orderBy';
import type { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';

import type { SearchParams } from '@personio-web/design-system-component-table';
import type { PersonColumnConditions } from '../../filters/filterByPerson';
import { filterByPerson } from '../../filters/filterByPerson';
import type { EmployeeCodeColumnConditions } from '../../filters/filterByEmployeeCode';
import { filterByEmployeeCode } from '../../filters/filterByEmployeeCode';
import type { BlockersColumnConditions } from '../../filters/filterByBlockers';
import {
  concatBlockers,
  filterByBlockers,
} from '../../filters/filterByBlockers';
import type { OfficeColumnConditions } from '../../filters/filterByOffice';
import { filterByOffice } from '../../filters/filterByOffice';

import type { Filter } from '../../filters/types';
import { SortingKey } from '@personio-web/payroll-feature-integration-people-table-types';

const getSortingKey = (key?: keyof PeopleData): SortingKey<PeopleData> => {
  if (key == 'person') return ['person.lastName', 'person.firstName'];
  if (key == 'office') return 'office.officeName';
  return key;
};

export function getProcessedPeopleData(
  peopleData: PeopleData[],
  params: SearchParams,
): PeopleData[] {
  let filteredData = [...peopleData];
  // Filtering by Person field
  const personFilterConfig = params.filters
    ?.person as Filter<PersonColumnConditions>;
  if (personFilterConfig)
    filteredData = filterByPerson(filteredData, personFilterConfig);

  // Filtering by EmployeeCode field
  const employeeNumberFilterConfig = params.filters
    ?.employeeCode as Filter<EmployeeCodeColumnConditions>;
  if (employeeNumberFilterConfig)
    filteredData = filterByEmployeeCode(
      filteredData,
      employeeNumberFilterConfig,
    );

  // Filtering by Blockers field
  const blockersFilterConfig = params.filters
    ?.blockers as Filter<BlockersColumnConditions>;
  if (blockersFilterConfig)
    filteredData = filterByBlockers(filteredData, blockersFilterConfig);

  // Filtering by Office field
  const officeFilterConfig = params.filters
    ?.office as Filter<OfficeColumnConditions>;
  if (officeFilterConfig)
    filteredData = filterByOffice(filteredData, officeFilterConfig);

  // Searching
  const { search } = params;
  const keyword = search.toLowerCase();
  filteredData = filteredData.filter(
    (data) =>
      data.person.firstName.toLowerCase().includes(keyword) ||
      data.person.lastName.toLowerCase().includes(keyword) ||
      data.employeeCode.startsWith(keyword) ||
      concatBlockers(data.blockers).toLowerCase().includes(keyword) ||
      data.office.officeName.toLowerCase().includes(keyword),
  );

  // Sorting
  const { sortingId, sortingOrder } = params;
  const sortingKeys = getSortingKey(sortingId as keyof PeopleData);
  const sortingOrders = Array.isArray(sortingKeys)
    ? Array(sortingKeys.length).fill(sortingOrder)
    : sortingOrder;
  return orderBy(filteredData, sortingKeys, sortingOrders);
}
