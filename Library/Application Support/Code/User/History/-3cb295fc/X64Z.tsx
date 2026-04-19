import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';

import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { OrganizationTabs } from '@personio-web/employees-organizations-feature-organization-tabs';
import { type OrgChartView } from '@personio-web/employees-organizations-view-org-chart';
import {
  PageHierarchical,
  TableStickyHeader,
} from 'designSystem/component/page';
import { OrgChart as OrgChartFeature } from '@personio-web/employees-organizations-feature-org-chart';
import { useGetFeatureAccess } from '@personio-web/employees-organizations-data-feature-access';
import { NoAccessRights } from '@personio-web/employees-organizations-feature-org-units';
import { ErrorBoundary } from '@sentry/nextjs';
import { goferClient } from '@personio-web/employees-organizations-data-gofer';
import { AmplitudeProvider } from '@personio-web/amplitude-provider';
// Legacy usage of Apollo, prior to the introduction of the Gofer client
// eslint-disable-next-line no-restricted-imports
import { ApolloProvider } from '@apollo/client';
import { useOrgChartSurvey } from './hooks/useOrgChartSurvey';
import { useOtherPeopleDrawer } from './hooks/useOtherPeopleDrawer';
import { usePersonDetailsDrawer } from './hooks/usePersonDetailsDrawer';
import { useOrgUnitDetailsDrawer } from './hooks/useOrgUnitDetailsDrawer';
import styles from './OrgChart.module.scss';

const OrgChartViewComponent: OrgChartView = () => {
  useOrgChartSurvey();
  // Prefetch of translation namespace
  useTranslation('models');
  useTranslation('employees-organizations');
  const { t } = useTranslation('navigation');

  const featureAccess = useGetFeatureAccess({
    requestPathParams: { area: 'org_chart' },
  });
  const isAccessGranted = !!featureAccess.data?.data?.org_chart;

  const pageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const otherPeopleDrawer = useOtherPeopleDrawer();
  const personDetailsDrawer = usePersonDetailsDrawer();
  const orgUnitDetailsDrawer = useOrgUnitDetailsDrawer();

  const isPanelOpen =
    isAccessGranted &&
    (otherPeopleDrawer.isOpen ||
      personDetailsDrawer.isOpen ||
      orgUnitDetailsDrawer.isOpen);

  const closePanel = () => {
    if (otherPeopleDrawer.isOpen) otherPeopleDrawer.close();
    if (personDetailsDrawer.isOpen) personDetailsDrawer.close();
    if (orgUnitDetailsDrawer.isOpen) orgUnitDetailsDrawer.close();
  };

  if (featureAccess.isLoading) return;

  return (
    <div className={styles.container}>
      <Head>
        <title>{t('main.org-chart')}</title>
      </Head>
      <PageHierarchical.Root
        pageRef={pageRef}
        stickyHeaderRef={stickyRef}
        panelOpen={isPanelOpen}
        onPanelOpenChange={(open) => {
          console.log('[] state', open, isPanelOpen, closePanel);
          if (!open) closePanel();
        }}
      >
        <PageHierarchical.NavigationBar title={t('main.organization')}>
          <TableStickyHeader />
        </PageHierarchical.NavigationBar>
        <PageHierarchical.LayoutFullWidth>
          {!isAccessGranted ? (
            <NoAccessRights />
          ) : (
            <OrganizationTabs activeTab="org-chart" view="org-chart">
              <OrgChartFeature />
            </OrganizationTabs>
          )}
        </PageHierarchical.LayoutFullWidth>
        <PageHierarchical.Panel>
          {otherPeopleDrawer.isOpen && <otherPeopleDrawer.Drawer />}
          {personDetailsDrawer.isOpen && (
            <personDetailsDrawer.Drawer
              employeeId={personDetailsDrawer.data?.employeeId}
            />
          )}
          {orgUnitDetailsDrawer.isOpen && (
            <orgUnitDetailsDrawer.Drawer
              orgUnitId={orgUnitDetailsDrawer.data?.orgUnitId}
              orgUnitType={orgUnitDetailsDrawer.data?.orgUnitType}
            />
          )}
        </PageHierarchical.Panel>
      </PageHierarchical.Root>
    </div>
  );
};

export const OrgChart = () => (
  <ErrorBoundary>
    <DialogProvider>
      <ApolloProvider client={goferClient}>
        <AmplitudeProvider>
          <OrgChartViewComponent />
        </AmplitudeProvider>
      </ApolloProvider>
    </DialogProvider>
  </ErrorBoundary>
);
