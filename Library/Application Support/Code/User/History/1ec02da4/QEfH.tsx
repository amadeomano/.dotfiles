import { useMemo, useRef } from 'react';

import { useListOrgUnits } from '@personio-web/employees-organizations-data-org-units';
import {
  OrgUnitDetails,
  OrgUnitsCreate,
  OrgUnitsEdit,
  OrgUnitsTable,
  OrgUnitsDelete,
  NoAccessRights,
} from '@personio-web/employees-organizations-feature-org-units';
import { OrganizationTabs } from '@personio-web/employees-organizations-feature-organization-tabs';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { parseOrgUnitsParams } from '@personio-web/employees-organizations-util-org-units';
import type { OrgUnitsView } from '@personio-web/employees-organizations-view-org-units';
import { Translate } from '@personio-web/translate-component';
import { ErrorBoundary } from '@sentry/nextjs';
import { Link } from 'designSystem/component/link';
import {
  BreadcrumbNav,
  PageHierarchical,
  TableStickyHeader,
} from 'designSystem/component/page';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import styles from './OrgUnits.module.scss';
import { mapTypeToTab } from './utils/mapTypeToTab';

export const OrgUnits: OrgUnitsView = () => {
  const { t } = useTranslation('navigation');
  const pageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { type, action, id, basePath } = parseOrgUnitsParams(router.asPath);

  const { data, isLoading, isError } = useListOrgUnits(
    {
      type,
      include_metadata_options: true,
    },
    { enabled: true },
  );
  const hasAccessRights = data?._meta?.options?.can_edit === 'true';
  const showNoAccessRightsError = !isLoading && !isError && !hasAccessRights;

  const activeTab = mapTypeToTab(type);
  const isPanelOpen = action === 'edit' || action === 'details';
  const title = type === 'department' ? t('main.departments') : t('main.teams');
  const breadcrumbs = useMemo(
    () => [
      {
        id: 'settings',
        label: t('main.settings'),
        link: {
          href: '/configuration',
        },
      },
      {
        id: 'org-chart',
        label: t('main.organization'),
        isVisible: true,
      },
    ],
    [t],
  );

  const onPanelOpenChange = () => {
    router.push(basePath);
  };

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
            <PageHierarchical.NavigationBar backLinkHref="/configuration">
              <BreadcrumbNav breadcrumbSchema={breadcrumbs} />
              <TableStickyHeader />
            </PageHierarchical.NavigationBar>
            <PageHierarchical.LayoutFullWidth
              title={showNoAccessRightsError ? '' : t('main.organization')}
            >
              {showNoAccessRightsError ? (
                <NoAccessRights />
              ) : (
                <OrganizationTabs activeTab={activeTab} view="org-units">
                  {action === 'create' && <OrgUnitsCreate type={type} />}
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
              {action === 'details' && id && (
                <OrgUnitDetails id={id} type={type} />
              )}
              {action === 'edit' && id && <OrgUnitsEdit id={id} type={type} />}
            </PageHierarchical.Panel>
          </PageHierarchical.Root>
        </DialogProvider>
      </div>
    </ErrorBoundary>
  );
};
