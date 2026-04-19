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
import { serializeSort, deserializeSort } from './utils/serialization';
import {
  getPageParams,
  getTableParams,
  createUrl,
  setTableParam,
  commitNavigation,
} from './utils/integrations/a3/navigationParams';

import type { A3PeopleTableFeature } from '@personio-web/payroll-feature-integration-people-table';
import type { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import type { FilterConfig } from 'designSystem/component/table';

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
      filterConfig={filtersConfig as FilterConfig<PeopleData>[]}
      data={processedData}
      getRowId={getPersonId}
      isError={isPeopleError || isLegalEntitiesError}
    />
  );
};
