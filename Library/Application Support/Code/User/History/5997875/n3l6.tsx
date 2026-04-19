import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { XeroPeopleTableFeature } from '@personio-web/payroll-feature-integration-people-table';
import type { XeroPeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { useLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';
import { FilterConfig, Table, useTable } from 'designSystem/component/table';
import { icons } from 'designSystem/component/icon';
import {
  getColumnsConfig,
  getPersonId,
} from './config/integrations/xero/columnsConfig';
import { filtersConfig } from './config/integrations/xero/filtersConfig';
import {
  usePeopleData,
  XeroPeopleData as PeopleData,
} from '@personio-web/payroll-data-payroll-integration-hub';
import { mapTableToSearchParams } from './utils/mapTableToSearchParams';
import { getProcessedPeopleData } from './utils/integrations/xero/getProcessedPeopleData';
import {
  getNavigationParams,
  getTableState,
} from './utils/tableNavigationStateUtils';
import {
  deserializeArrayFilter,
  deserializeFilter,
  deserializeSort,
  serializeFilter,
  serializeSort,
} from './utils/serialization';
import {
  createUrl,
  getPageParams,
  getTableParams,
  setTableParam,
  deleteTableParam,
  commitNavigation,
} from './utils/integrations/xero/navigationParams';
import { ColumnFilter } from '@personio-web/design-system-component-table-types';
import { TRANSLATION_NAMESPACE } from './utils/constants';
import { TEMP_TRANSLATIONS as T } from '../temp-translations';
import { useRouter } from 'next/router';

export const findFilter = (
  // TODO: remove salaryType once BE moves it to root
  id: keyof XeroPeopleData | 'salaryType',
  filters: ColumnFilter[] | undefined = [],
) => filters.find((filter) => filter.id === id);

export const XeroPeopleTable: XeroPeopleTableFeature = () => {
  const router = useRouter();
  const { t } = useTranslation(TRANSLATION_NAMESPACE);
  const tableUrlParams = getTableParams(router.query);
  const pageUrlParams = getPageParams(router.query);

  const {
    isLoading: isPeopleLoading,
    isError: isPeopleError,
    data,
  } = usePeopleData('xero', pageUrlParams.legalEntityId);
  const { isLoading: isLegalEntitiesLoading, isError: isLegalEntitiesError } =
    useLegalEntities();

  // Execusion order is purposefully before `useTable` since `useTable` reads its data from URL
  useEffect(() => {
    if (!pageUrlParams.legalEntityId) return;
    if (tableUrlParams.sort) return;
    const newUrl = createUrl(router, false);
    const defaultSort = serializeSort({ id: 'blockers', desc: true });
    setTableParam(newUrl, 'sort', defaultSort);
    commitNavigation(router, newUrl);
  }, [router.asPath]);

  // TODO: remove this useEffect once backend supports hourly transfers too
  useEffect(() => {
    setFiltersState(
      pageUrlParams.payGroup
        ? [...filtersConfig.slice(0, 3), ...filtersConfig.slice(4)]
        : [...filtersConfig],
    );
    // if (tableUrlParams.salaryType) return;
    // const newUrl = createUrl(router, false);
    // const defaultFilter = serializeFilter({
    //   id: 'salaryType',
    //   value: {
    //     value: ['FIXED'],
    //     condition: 'contains',
    //   },
    // });
    // setTableParam(newUrl, 'salaryType', defaultFilter);
    // commitNavigation(router, newUrl);
  }, [router.asPath]);

  const table = useTable({
    state: {
      sorting: deserializeSort(tableUrlParams.sort),
      filters: [
        deserializeFilter(tableUrlParams.person),
        deserializeFilter(tableUrlParams.employeeNumber),
        deserializeFilter(tableUrlParams.blockers),
        deserializeArrayFilter(tableUrlParams.salaryType),
        deserializeFilter(tableUrlParams.grossPay),
      ].filter(Boolean) as ColumnFilter[],
    },
    onTableStateChange: ({ sorting: sortingState, filters: filtersState }) => {
      const newUrl = createUrl(router, false);

      if (sortingState)
        setTableParam(newUrl, 'sort', serializeSort(sortingState));
      else if (tableUrlParams.sort) setTableParam(newUrl, 'sort', 'none');

      const personFilter = findFilter('person', filtersState);
      if (personFilter) {
        const serializedSalaryType = serializeFilter(personFilter);
        setTableParam(newUrl, 'person', serializedSalaryType);
      } else deleteTableParam(newUrl, 'person');

      const employeeNumberFilter = findFilter('employeeNumber', filtersState);
      if (employeeNumberFilter) {
        const serializedSalaryType = serializeFilter(employeeNumberFilter);
        setTableParam(newUrl, 'employeeNumber', serializedSalaryType);
      } else deleteTableParam(newUrl, 'employeeNumber');

      const blockersFilter = findFilter('blockers', filtersState);
      if (blockersFilter) {
        const serializedSalaryType = serializeFilter(blockersFilter);
        setTableParam(newUrl, 'blockers', serializedSalaryType);
      } else deleteTableParam(newUrl, 'blockers');

      const salaryTypeFilter = findFilter('salaryType', filtersState);
      if (salaryTypeFilter) {
        const serializedSalaryType = serializeFilter(salaryTypeFilter);
        setTableParam(newUrl, 'salaryType', serializedSalaryType);
      } else deleteTableParam(newUrl, 'salaryType');

      const grossPayFilter = findFilter('grossSalary', filtersState);
      if (grossPayFilter) {
        const serializedSalaryType = serializeFilter(grossPayFilter);
        setTableParam(newUrl, 'grossPay', serializedSalaryType);
      } else deleteTableParam(newUrl, 'grossPay');

      commitNavigation(router, newUrl);
    },
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
      filterConfig={filtersState as FilterConfig<PeopleData>[]}
      data={processedData}
      getRowId={getPersonId}
      isError={isPeopleError || isLegalEntitiesError}
      errorConfig={{
        noDataAvailableYet: {
          icon: icons.documentText,
          title: T['xero-people'].errorState.noData.title,
          description: T['xero-people'].errorState.noData.description,
        },
      }}
    />
  );
};
