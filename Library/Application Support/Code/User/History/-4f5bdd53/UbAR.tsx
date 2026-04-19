import { useTranslation } from 'react-i18next';
import { useLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';
import { Table, useTable, FilterConfig } from 'designSystem/component/table';
import {
  getColumnsConfig,
  getPersonId,
} from './config/integrations/a3/columnsConfig';
import { filtersConfig } from './config/integrations/a3/filtersConfig';
import { usePeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import type { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { mapTableToSearchParams } from './utils/mapTableToSearchParams';
import { getProcessedPeopleData } from './utils/integrations/a3/getProcessedPeopleData';
import { TRANSLATION_NAMESPACE } from './utils/constants';
import type { A3PeopleTableFeature } from '@personio-web/payroll-feature-integration-people-table';

export const A3PeopleTable: A3PeopleTableFeature = () => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE);
  const table = useTable();

  const {
    isLoading: isPeopleLoading,
    isError: isPeopleError,
    data,
  } = usePeopleData('a3', navigatorParams.legalEntityId);
  const { isLoading: isLegalEntitiesLoading, isError: isLegalEntitiesError } =
    useLegalEntities();

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
