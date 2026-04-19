import { useEffect, useRef } from 'react';

import {
  DialogProvider,
  useDialogContext,
} from '@personio-web/employees-organizations-hook-use-dialog-context';
import { OrganizationTabs } from '@personio-web/employees-organizations-feature-organization-tabs';
import { ProfileDrawer } from '@personio-web/employees-organizations-feature-profile-drawer';
import { type OrgChartView } from '@personio-web/employees-organizations-view-org-chart';
import {
  PageHierarchical,
  TableStickyHeader,
} from 'designSystem/component/page';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import {
  OrgChart as OrgChartFeature,
  OtherPeopleDrawer,
} from '@personio-web/employees-organizations-feature-org-chart';
import { useGetFeatureAccess } from '@personio-web/employees-organizations-data-feature-access';
import { NoAccessRights } from '@personio-web/employees-organizations-feature-org-units';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useCustomEvent } from '@personio-web/use-custom-event';

import { goferClient } from '@personio-web/employees-organizations-data-gofer';
import { AmplitudeProvider } from '@personio-web/amplitude-provider';
import { ApolloProvider } from '@apollo/client';
import { useOrgChartSurvey } from './hooks/useOrgChartSurvey';
import { FeatureFlags } from './consts/featureFlags';
import styles from './OrgChart.module.scss';

const ORG_CHART_VIEWED = 'org_chart_viewed';
const TRIGGER_TIMES_PAGE_VIEWED = 3;
const updatedEvent = 'personalInformation/updated';

const ProfileDrawerAttributeIds = [
  PersonSystemAttribute.Email,
  PersonSystemAttribute.LegalEntity,
  PersonSystemAttribute.Department,
  PersonSystemAttribute.Team,
  PersonSystemAttribute.Office,
  PersonSystemAttribute.Position,
  PersonSystemAttribute.EmploymentType,
  PersonSystemAttribute.Status,
];

const OrgChartViewComponent: OrgChartView = () => {
  // Prefetch of translation namespace
  useTranslation('models');
  useTranslation('employees-organizations');
  const { t } = useTranslation('navigation');

  const { runSurvey } = useOrgChartSurvey({
    triggerName: ORG_CHART_VIEWED,
    laxEligibility: false,
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const { isDialogOfType, dialogState, closeDialog } = useDialogContext();
  const isOtherPeopleDrawerOpen = isDialogOfType(
    'org-chart.other-people',
    dialogState,
  );
  const isPersonDrawerOpen = isDialogOfType(
    'org-chart.person-drawer',
    dialogState,
  );
  const panelOpen = isOtherPeopleDrawerOpen || isPersonDrawerOpen;

  useCustomEvent(updatedEvent, closeDialog);

  const { data: featureAccess, isFetching: featureAccessLoading } =
    useGetFeatureAccess({
      requestPathParams: { area: 'org_chart' },
    });
  const hasUserFeatureAccess = !!featureAccess?.data?.org_chart;

  const { isOn: isSurveyEnabled, isReady: isSurveyReady } = useFeatureFlag(
    FeatureFlags.LAUNCH_SURVEY,
  );
  const isSurveyEnabledReady = isSurveyEnabled && isSurveyReady;

  const { isOn: isPersonDrawerEnabled, isReady: isPersonDrawerReady } =
    useFeatureFlag(FeatureFlags.ENABLE_PERSON_DRAWER);
  const isPersonDrawerEnabledReady =
    isPersonDrawerEnabled && isPersonDrawerReady;

  useEffect(() => {
    const times = Number(localStorage.getItem(ORG_CHART_VIEWED) || 1);

    const timeoutId = setTimeout(() => {
      if (isSurveyEnabledReady && times >= TRIGGER_TIMES_PAGE_VIEWED) {
        runSurvey({});
      }
    }, 1000 * 30); // 30s

    // just to avoid updating unncessarily
    if (times < TRIGGER_TIMES_PAGE_VIEWED) {
      localStorage.setItem(ORG_CHART_VIEWED, String(times + 1));
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [runSurvey, isSurveyEnabledReady]);

  // TODO add a Loading State component
  if (featureAccessLoading) return;

  return (
    <div className={styles.container}>
      <Head>
        <title>{t('main.org-chart')}</title>
      </Head>
      <PageHierarchical.Root
        pageRef={pageRef}
        stickyHeaderRef={stickyRef}
        panelOpen={panelOpen}
        onPanelOpenChange={(open) => !open && closeDialog()}
      >
        <PageHierarchical.NavigationBar>
          <TableStickyHeader />
        </PageHierarchical.NavigationBar>
        <PageHierarchical.LayoutFullWidth
          title={hasUserFeatureAccess ? t('main.organization') : ''}
        >
          {!hasUserFeatureAccess ? (
            <NoAccessRights />
          ) : (
            <OrganizationTabs activeTab="org-chart" view="organization">
              <OrgChartFeature />
            </OrganizationTabs>
          )}
        </PageHierarchical.LayoutFullWidth>
        <PageHierarchical.Panel>
          {isOtherPeopleDrawerOpen && <OtherPeopleDrawer />}
          {isPersonDrawerEnabledReady &&
            isPersonDrawerOpen &&
            !isOtherPeopleDrawerOpen &&
            dialogState.data.employeeId && (
              <ProfileDrawer
                employeeId={dialogState.data.employeeId}
                attributeIds={ProfileDrawerAttributeIds}
              />
            )}
        </PageHierarchical.Panel>
      </PageHierarchical.Root>
    </div>
  );
};

export const OrgChart = () => (
  <DialogProvider>
    <ApolloProvider client={goferClient}>
      <AmplitudeProvider>
        <OrgChartViewComponent />
      </AmplitudeProvider>
    </ApolloProvider>
  </DialogProvider>
);
