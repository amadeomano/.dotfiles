import { useCallback, useEffect, useMemo } from 'react';

import { useAuthContext } from '@personio-web/auth-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useGetJobs } from '@personio-web/workforce-planning-data-jobs';
import { useBuildExportPositions } from '@personio-web/workforce-planning-data-positions';
import { useAccessRightsContext } from '@personio-web/workforce-planning-feature-access-rights-context';
import {
  usePositionFormContext,
  usePositionHandling,
} from '@personio-web/workforce-planning-feature-position-form';
import { useActivePositions } from '@personio-web/workforce-planning-hook-active-positions';
import { usePersistedTableConfig } from '@personio-web/workforce-planning-hook-persisted-table-config';
import {
  convertJobsToFilters,
  FeatureFlags,
  getOrderBy,
  toCEL,
} from '@personio-web/workforce-planning-util-common';
import {
  type PositionRow,
  Status,
} from '@personio-web/workforce-planning-util-domain';
import { generateOrgChartLink } from '@persnio-web/eo-commons-org-chart-link';
import type { Row } from '@tanstack/react-table';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { icons } from 'designSystem/component/icon';
import { usePageContext } from 'designSystem/component/page';
import { Table, useTable } from 'designSystem/component/table';
import { toaster } from 'designSystem/component/toaster';
import { useGetFeatureAccess } from 'employeesOrganizations/data/feature-access';
import { usePeopleFilterConfig } from 'employeesOrganizations/hook/use-people-filter-config';
import { useTranslation } from 'react-i18next';

import { buildColumnConfig } from './config/columnConfig';
import { tableInitialState } from './config/tableInitialState';
import { useOpenPositionFromURL } from './hooks/useOpenPositionFromURL';
import styles from './PositionsList.module.scss';
import type { PositionsList as PositionsListFeature } from './types';
import { buildFiltersConfig } from './utils/buildFiltersConfig';

export const PositionsList: PositionsListFeature = () => {
  const { position } = usePositionFormContext();
  const { openExistingPositionDrawer, openNewPositionDrawer } =
    usePositionHandling();

  const { config: persistedTableConfig, saveConfig } = usePersistedTableConfig({
    configName: 'positionList',
  });

  const table = useTable(
    persistedTableConfig
      ? { state: { ...persistedTableConfig } }
      : tableInitialState,
  );

  const areRowsEqual = useCallback(
    (oldRow: Row<PositionRow>, newRow: Row<PositionRow>) => {
      return (
        oldRow.original.id === newRow.original.id &&
        oldRow.original.updateDateTime === newRow.original.updateDateTime
      );
    },
    [],
  );

  useMemo(() => {
    saveConfig({
      sorting: table.sorting.sorting,
      filters: table.filters.filters,
      order: table.order.order,
      hiddenColumns: table.columnVisibility.hiddenColumns,
    });
  }, [
    table.sorting.sorting,
    table.filters.filters,
    table.order.order,
    table.columnVisibility.hiddenColumns,
    saveConfig,
  ]);

  const eoFilterConfig = usePeopleFilterConfig(
    [
      {
        attributeId: 'department_id',
        isFilterable: true,
      },
    ],
    false,
  );

  const { t } = useTranslation('workforce-planning');
  const ds = useTranslation('design-system');
  const tds = ds.t;

  const { companyId } = useAuthContext();
  const { data: jobs } = useGetJobs({
    requestHeader: {
      'X-Company-Id': String(companyId),
    },
  });

  const { isOn: showSalaryInfo } = useFeatureFlag(
    FeatureFlags.POSITIONS_SALARY_ON_LIST,
  );
  const { isOn: wfp732ShowNewPositionAttributes } = useFeatureFlag(
    FeatureFlags.WFP_716_NEW_ATTRS,
  );
  const { isOn: wfp1275TargetSalary } = useFeatureFlag(
    FeatureFlags.WFP_1275_TARGET_SALARY,
  );

  const columnConfig = buildColumnConfig(t, {
    showSalaryInfo,
    companyId,
    wfp732ShowNewPositionAttributes,
    wfp1275TargetSalary,
  });
  const jobsFiltersConfig = useMemo(() => convertJobsToFilters(jobs), [jobs]);
  const filterConfig = useMemo(
    () =>
      buildFiltersConfig({
        statuses: [
          { id: Status.OPEN, name: t('positions.statuses.open') },
          { id: Status.FILLED, name: t('positions.statuses.filled') },
          {
            id: Status.ARCHIVED,
            name: t('positions.statuses.archived'),
          },
        ],
        jobs: jobsFiltersConfig.jobs,
        jobFamilies: jobsFiltersConfig.jobFamilies,
        levels: jobsFiltersConfig.levels,
        tracks: jobsFiltersConfig.tracks,
      }),
    [jobsFiltersConfig, t],
  );

  const orderByQuery = getOrderBy(table.sorting.sorting);
  const filterQuery = toCEL(table.filters.filters || []);

  const {
    positions,
    totalPositionsCount,
    fetchNextPage,
    refetch,
    isFetching,
    isError,
  } = useActivePositions({
    orderBy: orderByQuery,
    filter: filterQuery,
  });

  const { url: exportURL } = useBuildExportPositions({
    order_by: orderByQuery,
    filter: filterQuery,
  });

  const onRowClick = useCallback(
    ({ row }: { row: { original: PositionRow } }) => {
      openExistingPositionDrawer(row.original);
    },
    [],
  );

  const onExport = () => {
    window.location.href = exportURL;
  };

  const {
    positions: { hasEditRights },
  } = useAccessRightsContext();
  const { pageRef, stickyHeaderRef } = usePageContext();

  // If there is an error in getting data after the initial load, we don't want to loose whats in the table with a customer errorBoundry.
  // Instead we notify via a toast that something has gone wrong.
  useEffect(() => {
    if (isError && positions.length > 0) {
      toaster.notify({
        variant: 'error',
        description: t('errors.generic-message'),
        duration: 3000,
      });
    }
  }, [positions.length, isError, t]);

  const { openPositionFromURL } = useOpenPositionFromURL();
  useEffect(() => {
    openPositionFromURL();
  }, []);

  const { data } = useGetFeatureAccess({
    requestPathParams: { area: 'org_chart' },
  });
  const isOrgChartAccessible = Boolean(data?.data?.org_chart);
  const orgChartLink = isOrgChartAccessible
    ? generateOrgChartLink({
        cardCustomizationPreferences: {
          openPositions: true,
          cardClustering: true,
          personalInfo: true,
          avatars: true,
        },
      })
    : null;

  // TODO: update this approach when EO's hook will be more configurable
  // so far they agreed with this consumer-side hook
  // https://personio.slack.com/archives/CFA01PCTE/p1737371812815389
  const patchedEoFilterConfig = useMemo(() => {
    return (
      eoFilterConfig?.map((config) => ({
        ...config,
        // need to remove conditions array,
        // as contains is returned which is not supported by our BE now
        conditions: undefined,
      })) ?? []
    );
  }, [eoFilterConfig]);

  // Key is needed to force React to re-render the table because, for the first time
  // filters have 1 (status), and for the the second time it has 3 (status, jobs, jobFamilies)
  const key = filterConfig.length + patchedEoFilterConfig.length;

  return (
    <Table
      key={key}
      className={styles.positionsTable}
      table={table}
      isError={isError}
      enableColumnVisibility
      enableColumnReordering
      pinnedColumns={2}
      getRowId={(row) => row.publicId!}
      columnConfig={columnConfig}
      isLoading={isFetching}
      data={positions}
      // TODO: fix TS types for rows
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onRowClick={onRowClick}
      pageType="infinite"
      totalResults={totalPositionsCount}
      onLoadMore={fetchNextPage}
      containerRef={pageRef}
      stickyHeaderRef={stickyHeaderRef}
      areRowsEqual={areRowsEqual}
      errorConfig={{
        failedToFetchData: {
          secondaryButton: {
            children: tds('table.errors.error-boundary-button-label'),
            onClick: () => {
              refetch();
            },
          },
        },
      }}
      highlightedRowId={position?.publicId}
    >
      <ControlBar>
        <Controls.Sort />
        <Controls.Filter
          filterConfig={[...filterConfig, ...patchedEoFilterConfig]}
        />
        <Controls.Columns />

        {orgChartLink ? (
          <Controls.More>
            <DropdownMenu.Item
              id="orgChart"
              name={t('positions.org-chart-link-label')}
              icon={icons.orgChart}
              onSelect={() => window.open(orgChartLink, '_blank')}
            />
          </Controls.More>
        ) : null}

        <Controls.Share>
          <DropdownMenu.Item
            id="export-positions"
            name={t('positions.export-as-csv')}
            icon={icons.rectangleHorizontalArrowUp}
            onSelect={onExport}
          />
        </Controls.Share>

        {hasEditRights ? (
          <Controls.Primary
            label={t('position-form.new-position')}
            onClick={openNewPositionDrawer}
          />
        ) : null}
      </ControlBar>
    </Table>
  );
};
