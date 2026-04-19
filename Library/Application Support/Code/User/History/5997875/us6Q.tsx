import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';
import {
  FilterConfig,
  Table,
  useTable,
  UseTableParams,
} from 'designSystem/component/table';
import { icons } from 'designSystem/component/icon';
import {
  getColumnsConfig,
  getPersonId,
} from './config/integrations/xero/columnsConfig';
import { filtersConfig } from './config/integrations/xero/filtersConfig';
import { usePeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { mapTableToSearchParams } from './utils/mapTableToSearchParams';
import { getProcessedPeopleData } from './utils/integrations/xero/getProcessedPeopleData';
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
import { TRANSLATION_NAMESPACE } from './utils/constants';
import { TEMP_TRANSLATIONS as T } from '../temp-translations';
import { useRouter } from 'next/router';

import type { NextRouter } from 'next/router';
import type { XeroPeopleTableFeature } from '@personio-web/payroll-feature-integration-people-table';
import type { XeroPeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import type { ColumnFilter } from '@personio-web/design-system-component-table-types';
import type {
  FilterConfig,
  Table,
  UseTableParams,
} from 'designSystem/component/table';

export const findFilter = (
  // TODO: remove salaryType once BE moves it to root
  id: keyof PeopleData | 'salaryType',
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
  };

export const XeroPeopleTable: XeroPeopleTableFeature = () => {
  const router = useRouter();
  const { t } = useTranslation(TRANSLATION_NAMESPACE);
  const tableUrlParams = getTableParams(router.query);
  const pageUrlParams = getPageParams(router.query);
  const [filtersState, setFiltersState] = useState(filtersConfig);

  const {
    isLoading: isPeopleLoading,
    isError: isPeopleError,
    data,
  } = usePeopleData('xero', pageUrlParams.legalEntityId);
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

  // TODO: remove this useEffect once backend supports hourly transfers too
  useEffect(() => {
    setFiltersState(
      pageUrlParams.payGroup
        ? filtersConfig.filter((filter) => filter.columnId !== 'salaryType')
        : filtersConfig,
    );
    if (pageUrlParams.payGroup) return;
    if (tableUrlParams.salaryType) return;
    const newUrl = createUrl(router, false);
    const defaultFilter = serializeFilter({
      id: 'salaryType',
      value: {
        value: ['FIXED'],
        condition: 'contains',
      },
    });
    setTableParam(newUrl, 'salaryType', defaultFilter);
    commitNavigation(router, newUrl);
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
