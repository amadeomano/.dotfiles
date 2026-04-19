import { useEffect, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import {
  useQueryOrgUnits,
  type UseQueryOrgUnitsGoferReturnType,
} from '@personio-web/employees-organizations-hook-use-query-org-units';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { ControlBar, Controls } from 'designSystem/component/control-bar';
import { Table, useTable } from 'designSystem/component/table';
import { toaster } from 'designSystem/component/toaster';

import { useAuthContext } from '@personio-web/auth-context';
import { ExternalLinkDialog } from '../components/external-link-dialog';
import { useNavigation } from '../hooks';
import { serialize } from '../utils/queryParams';
import { TestIds } from '../utils/test-ids';
import { getOrgUnitId } from '../utils/getOrgUnitId';
import { type OrgUnitResult } from '../types';
import { getColumnConfig } from './config';
import type { OrgUnitsTableProps } from './types';
import styles from './OrgUnitsTable.module.scss';

const PAGE_SIZE = 100;

export const OrgUnitsTable = ({
  type,
  id,
  stickyRef,
  pageRef,
}: OrgUnitsTableProps) => {
  const { companyId } = useAuthContext();
  const { t } = useTranslation('org-units');
  const { openDialog, closeDialog, dialogState, isDialogOfType } =
    useDialogContext();

  const { isOn: isOnGH, isReady: isReadyGH } = useFeatureFlag(
    FeatureFlags.ENABLE_GLOBAL_HIERARCHIES,
  );
  const isGlobalHierarchiesEnabled = isReadyGH && isOnGH;

  const table = useTable({
    state: {
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
      sorting: { id: 'name', desc: false },
    },
  });

  // TODO OS-1341 replace with useGetOrgUnit when ULIDs are adopted
  // when using useGetOrgUnit, remove filter and pass id
  const { data: orgUnitsData, isLoading: isOrgUnitsLoading } = useListOrgUnits({
    variables: {
      companyId,
      filter: `legacy_id == ${id} && type == ${type}`,
      includeDepartmentId: type === 'department',
      includeTeamId: type === 'team',
      includeAncestors: true,
      includeAncestorNames: true,
      includeDirectMemberCount: true,
      includeDescendants: true,
      includeDescendantNames: true,
    },
    queryOptions: {
      enabled: Boolean(Number(id)) && Boolean(type),
    },
  });

  const currentOrgUnit = useMemo(
    () =>
      (!isOrgUnitsLoading
        ? orgUnitsData?.data?.orgUnits?.orgUnitsList?.[0]
        : null) ?? null,
    [orgUnitsData, isOrgUnitsLoading],
  );

  useEffect(() => {
    // TODO OS-1341 replace with ancestor.id.id when ULIDs are adopted
    const accessors = currentOrgUnit?.ancestors ?? [];
    const ancestorsIds = accessors
      .map((ancestor) => {
        const id = getOrgUnitId(ancestor as OrgUnitResult, type);
        return id ? String(id) : undefined;
      })
      .filter((item): item is string => item !== undefined);

    if (ancestorsIds.length) {
      table.expansion.updaters.replace((prevState) =>
        Array.isArray(prevState)
          ? [...new Set([...prevState, ...ancestorsIds])]
          : ancestorsIds,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentOrgUnit?.ancestors)]);

  useEffect(() => {
    const isSearching = Boolean(table.search.term.length);
    const expanded = Array.isArray(table.expansion.expanded)
      ? table.expansion.expanded
      : [];

    if (isSearching && expanded.length) {
      table.expansion.updaters.clear();
    }
  }, [table.search.term, table.expansion]);

  const { navigate } = useNavigation();

  const search = table.search.term;
  const sortOrder = table.sorting.sorting?.desc ? 'DESC' : 'ASC';
  const isSearching = search.length > 0;
  const filterByRootIds =
    (table.filters.filters[0]?.value.value as string[] | undefined)?.map(
      String,
    ) || [];
  const expandedRowIds = Array.isArray(table.expansion.expanded)
    ? table.expansion.expanded.map(String)
    : [];

  const {
    orgUnits,
    getOrgUnit,
    isFetching,
    isError,
    isRootError,
    isRootLoading,
    refetchRoot,
  } = useQueryOrgUnits<UseQueryOrgUnitsGoferReturnType>({
    source: 'org-units-table',
    type,
    search,
    sort: { by: 'name', order: sortOrder },
    filterByOrgUnitIds: filterByRootIds,
    expandedOrgUnitIds: expandedRowIds,
    queryConfig: {
      autoFetchNextPage: true,
      additionalParams: {
        includeDirectMemberCount: true,
        includeDescendants: true,
        includeDescendantNames: true,
        includeAncestors: true,
        includeAncestorNames: true,
        includeDepartmentId: type === 'department',
        includeTeamId: type === 'team',
      },
    },
    useLegacyId: true,
  });

  // Guarantee to show toaster only for subsequent errors
  if (isError) {
    const subLevelErrorMessage =
      type === 'team'
        ? 'table.errors.failed-to-fetch-sub-teams-label'
        : 'table.errors.failed-to-fetch-sub-departments-label';
    // Ensures we don't display multiple toast at the same time.
    toaster.clearAll();
    toaster.notify({
      description: t(subLevelErrorMessage),
      variant: 'error',
      showCloseButton: true,
    });
  }

  const columnConfig = useMemo(
    () =>
      getColumnConfig(
        t,
        (uri) => openDialog('org-units.table.external-link', { uri }),
        isGlobalHierarchiesEnabled,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGlobalHierarchiesEnabled],
  );

  return (
    <>
      {isDialogOfType('org-units.table.external-link', dialogState) && (
        <ExternalLinkDialog
          closeDialog={closeDialog}
          uri={dialogState.data.uri}
        />
      )}

      <Table
        table={table}
        className={styles.table}
        containerRef={pageRef}
        stickyHeaderRef={stickyRef}
        totalResults={orgUnits?.length}
        getRowId={(row) => String(row.id)}
        getSubRows={(row) => row.children ?? undefined}
        isError={isRootError}
        errorConfig={{
          failedToFetchData: {
            secondaryButton: {
              onClick: () => refetchRoot(),
              children: t('table.errors.failed-to-fetch-data-button-label'),
            },
          },
        }}
        onRowClick={({ row }) => {
          navigate.push(`/details/${row.id}`);
        }}
        pageType="infinite"
        columnConfig={columnConfig}
        isLoading={isRootLoading || (isFetching && !orgUnits.length)}
        data={orgUnits}
        enableExpanding={!isSearching}
        metadata={{ testId: 'org-units-table' }}
        highlightedRowId={String(id)}
      >
        <ControlBar>
          <Controls.Sort />
          <Controls.Search />
          <Controls.Primary
            metadata={{ testId: TestIds.AddNewButton }}
            icon={null as any}
            aria-label={t('table.add-new')}
            onClick={() => {
              const orgUnit = getOrgUnit(String(id));
              const parentId = orgUnit?.data?.id?.id ?? '';
              const query = id
                ? {
                    query: serialize({ parentId }),
                  }
                : undefined;
              navigate.push('/create', query);
            }}
            label={
              type === 'department'
                ? t('table.add-new-department')
                : t('table.add-new-team')
            }
          />
        </ControlBar>
      </Table>
    </>
  );
};
