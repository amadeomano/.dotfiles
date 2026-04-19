import { useCallback, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { OrgUnitsNavigationBreadcrumb } from '@personio-web/employees-organizations-component-org-units-navigation-breadcrumb';
import {
  OrgUnitDetails,
  OrgUnitsCreate,
  OrgUnitsEdit,
  OrgUnitsTable,
  OrgUnitsDelete,
  NoAccessRights,
} from '@personio-web/employees-organizations-feature-org-units';
import { OrganizationTabs } from '@personio-web/employees-organizations-feature-organization-tabs';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import {
  FeatureFlags,
  parseOrgUnitsParams,
} from '@personio-web/employees-organizations-util-org-units';
import type { OrgUnitsView } from '@personio-web/employees-organizations-view-org-units';
import { Translate } from '@personio-web/translate-component';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { ErrorBoundary } from '@sentry/nextjs';
import { Link } from 'designSystem/component/link';
import { PageHierarchical } from 'designSystem/component/page';
import { Slot } from 'designSystem/component/slot';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useAuthContext } from '@personio-web/auth-context';
import { mapTypeToTab } from './utils/mapTypeToTab';
import styles from './OrgUnits.module.scss';

export const OrgUnits: OrgUnitsView = () => {
  const { t } = useTranslation('navigation');
  const { companyId } = useAuthContext();
  const pageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { type, action, id, basePath } = parseOrgUnitsParams(router.asPath);
  const { isOn: isOnGH, isReady: isReadyGH } = useFeatureFlag(
    FeatureFlags.ENABLE_GLOBAL_HIERARCHIES,
  );
  const { isOn: isOnLeads, isReady: isReadyLeads } = useFeatureFlag(
    FeatureFlags.ENABLE_LEADS,
  );
  const isLeadsEnabled = isReadyLeads && isOnLeads;
  const isGlobalHierarchiesEnabled = isReadyGH && isOnGH;

  const { data, isLoading, isError } = useListOrgUnits({
    variables: {
      companyId,
      filter: `type == ${type}`,
      pageSize: 1,
      includeAccessRights: true,
    },
  });

  const hasAccessRights =
    data?.data?.orgUnits?.metadata?.accessRights?.permissionsList?.includes(
      'ROLE_PERMISSION_CAN_EDIT',
    );
  const showNoAccessRightsError = !isLoading && !isError && !hasAccessRights;

  const activeTab = mapTypeToTab(type);
  const isPanelOpen = action === 'edit' || action === 'details';
  const title = type === 'department' ? t('main.departments') : t('main.teams');

  const onPanelOpenChange = useCallback(() => {
    router.push(basePath);
  }, [basePath, router]);

  if (isLoading) return null;

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <Head>
          <title>{title}</title>
        </Head>
        <DialogProvider>
          <PageHierarchical.Root
            pageRef={pageRef}
            stickyHeaderRef={stickyRef}
            panelOpen={isPanelOpen}
            onPanelOpenChange={onPanelOpenChange}
          >
            <Slot name="PageHierarchical.NavigationBar">
              <OrgUnitsNavigationBreadcrumb />
            </Slot>
            <PageHierarchical.LayoutFullWidth
              title={
                showNoAccessRightsError ? '' : t('main.departments_and_teams')
              }
            >
              {showNoAccessRightsError ? (
                <NoAccessRights />
              ) : (
                <OrganizationTabs activeTab={activeTab} view="org-units">
                  {action === 'create' && (
                    <OrgUnitsCreate
                      type={type}
                      isGlobalHierarchiesEnabled={isGlobalHierarchiesEnabled}
                      isLeadsEnabled={isLeadsEnabled}
                    />
                  )}
                  {action === 'delete' && id && (
                    <OrgUnitsDelete id={id} type={type} />
                  )}
                  <p className={styles.subTitle}>
                    <Translate
                      namespace="org-units"
                      i18nKey={`alerts.${
                        type === 'department' ? 'departments' : 'teams'
                      }`}
                      components={{
                        'untrusted-link': (
                          <Link target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    />
                  </p>
                  <OrgUnitsTable
                    id={id}
                    type={type}
                    stickyRef={stickyRef}
                    pageRef={pageRef}
                  />
                  <div style={{ height: 8 }} />
                </OrganizationTabs>
              )}
            </PageHierarchical.LayoutFullWidth>
            <PageHierarchical.Panel>
              {action === 'details' && id && hasAccessRights && (
                <OrgUnitDetails
                  id={id}
                  type={type}
                  drawerConfig={{
                    showParentOrgUnit: true,
                    showSubOrgUnits: true,
                    onCloseClick: () => router.push(basePath),
                    onEditClick: () => router.push(`${basePath}/edit/${id}`),
                    onDeleteClick: () =>
                      router.push(`${basePath}/delete/${id}`),
                  }}
                />
              )}
              {action === 'edit' && id && hasAccessRights && (
                <OrgUnitsEdit
                  id={String(id)}
                  type={type}
                  isGlobalHierarchiesEnabled={isGlobalHierarchiesEnabled}
                  isLeadsEnabled={isLeadsEnabled}
                  onEditSuccess={(orgUnitId) => {
                    router.push(`${basePath}/details/${orgUnitId}`);
                    router.reload();
                  }}
                  onEditCancel={() => router.push(basePath)}
                  onDeleteClick={() => router.push(`${basePath}/delete/${id}`)}
                />
              )}
            </PageHierarchical.Panel>
          </PageHierarchical.Root>
        </DialogProvider>
      </div>
    </ErrorBoundary>
  );
};
