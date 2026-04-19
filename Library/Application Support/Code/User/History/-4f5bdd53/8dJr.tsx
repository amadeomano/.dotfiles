import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';
import { Table, useTable } from 'designSystem/component/table';
import {
  getColumnsConfig,
  getPersonId,
} from './config/integrations/a3/columnsConfig';
import { filtersConfig } from './config/integrations/a3/filtersConfig';
import { usePeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { mapTableToSearchParams } from './utils/mapTableToSearchParams';
import { getProcessedPeopleData } from './utils/integrations/a3/getProcessedPeopleData';
import { TRANSLATION_NAMESPACE } from './utils/constants';
import {
  serializeSort,
  deserializeSort,
  serializeFilter,
  deserializeFilter,
} from './utils/serialization';
import {
  getPageParams,
  getTableParams,
  createUrl,
  setTableParam,
  deleteTableParam,
  commitNavigation,
} from './utils/integrations/a3/navigationParams';

import type { NextRouter } from 'next/router';
import type { A3PeopleTableFeature } from '@personio-web/payroll-feature-integration-people-table';
import type { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import type {
  FilterConfig,
  UseTableParams,
  ColumnFilter,
} from 'designSystem/component/table';

export const findFilter = (
  id: keyof PeopleData,
  filters: ColumnFilter[] | undefined = [],
) => filters.find((filter) => filter.id === id);

export const handleTableStateChange =
  (
    router: NextRouter,
    isUrlContainingSort: boolean,
  ): UseTableParams['onTableStateChange'] =>
  ({ sorting: sortingState, filters: filtersState }) => {
    const newUrl = createUrl(router, false);

    if (sortingState)
      setTableParam(newUrl, 'sort', serializeSort(sortingState));
    else if (isUrlContainingSort) setTableParam(newUrl, 'sort', 'none');

    const personFilter = findFilter('person', filtersState);
    if (personFilter) {
      const serializedPerson = serializeFilter(personFilter);
      setTableParam(newUrl, 'person', serializedPerson);
    } else deleteTableParam(newUrl, 'person');

    const employeeNumberFilter = findFilter('employeeCode', filtersState);
    if (employeeNumberFilter) {
      const serializedEmployeeNumber = serializeFilter(employeeNumberFilter);
      setTableParam(newUrl, 'employeeCode', serializedEmployeeNumber);
    } else deleteTableParam(newUrl, 'employeeCode');

    const blockersFilter = findFilter('blockers', filtersState);
    if (blockersFilter) {
      const serializedBlockers = serializeFilter(blockersFilter);
      setTableParam(newUrl, 'blockers', serializedBlockers);
    } else deleteTableParam(newUrl, 'blockers');

    const officeFilter = findFilter('office', filtersState);
    if (officeFilter) {
      const serializedOffice = serializeFilter(officeFilter);
      setTableParam(newUrl, 'office', serializedOffice);
    } else deleteTableParam(newUrl, 'office');

    commitNavigation(router, newUrl);
  };

export const A3PeopleTable: A3PeopleTableFeature = () => {
  const router = useRouter();
  const { t } = useTranslation(TRANSLATION_NAMESPACE);
  const pageUrlParams = getPageParams(router.query);
  const tableUrlParams = getTableParams(router.query);

  const {
    isLoading: isPeopleLoading,
    isError: isPeopleError,
    data,
  } = usePeopleData('a3', pageUrlParams.legalEntityId);
  const { isLoading: isLegalEntitiesLoading, isError: isLegalEntitiesError } =
    useLegalEntities();

  // Execusion order is purposefully before `useTable` since `useTable` reads its data from URL
  // Side effects (e.g. URL CRUD) should be adressed before useTable consumes them.
  useEffect(() => {
    if (!pageUrlParams.legalEntityId) return;
    if (tableUrlParams.sort) return;
    const newUrl = createUrl(router, false);
    const defaultSort = serializeSort({ id: 'blockers', desc: true });
    setTableParam(newUrl, 'sort', defaultSort);
    commitNavigation(router, newUrl);
  }, [router.asPath]);

  const table = useTable({
    state: {
      sorting: deserializeSort(tableUrlParams.sort),
      filters: [deserializeFilter(tableUrlParams.person)],
    },
    onTableStateChange: handleTableStateChange(
      router,
      Boolean(tableUrlParams.sort),
    ),
  });

  const searchParams = mapTableToSearchParams(table);
  const processedData = getProcessedPeopleData(data || [], searchParams);

  return (
    <Table
      enableColumnVisibility
      enableSearch
      frozenColumnId="employeeNumber"
      isLoading={isPeopleLoading || isLegalEntitiesLoading}
      table={table}
      columnConfig={getColumnsConfig(t)}
      filterConfig={filtersConfig as FilterConfig<PeopleData>[]}
      data={processedData}
      getRowId={getPersonId}
      isError={isPeopleError || isLegalEntitiesError}
    />
  );
};
