import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { PageShell } from 'designSystem/component/page-shell';
import { LastRefreshBanner } from '@personio-web/payroll-component-last-refresh-banner';
import { usePayrollContextData } from '@personio-web/payroll-data-payroll-integration-context';
import { usePeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { useStickyHeaderObserver } from '@personio-web/payroll-hook-use-sticky-header';

import { getConfigurationAlert } from './components/ConfigurationAlerts/utils';
import PayPeriodWidget from './components/PayPeriodWidget/PayPeriodWidget';
import PayrollTabs from './components/PayrollTabs/PayrollTabs';
import { RefreshButton } from './components/StickyHeader/components/RefreshButton/RefreshButton';
import TransferButton from './components/StickyHeader/components/TransferButton/TransferButton';
import { TransferStatusBanner } from './components/TransferStatusBanner/TransferStatusBanner';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';
import { getActiveCalendar } from './utils/getActiveCalendar';
import { isLEInitialized } from './utils/isLegalEntityInitialized';
import PageHeader from './PageHeader';
import { StickyHeaderVariant } from '../../types/StickyHeaderVariant';
import { TabsSchema } from '../../types/TabSchema';
import { TAB_SCHEMA } from '../../constants';
import { Tab } from '../../types/Tabs';
import { getParams } from '../../utils/navigationParams';

const AppLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { legalEntityId, payGroup } = getParams(router.query);

  const { data: context } = usePayrollContextData('xero', legalEntityId);
  const { data: peopleData, dataUpdatedAt: peopleDataUpdatedAt } =
    usePeopleData('xero', legalEntityId);

  const [stickyHeaderVariant, setStickyHeaderVariant] =
    useState<StickyHeaderVariant>('none');

  const stickyHeaderObserver = useStickyHeaderObserver();
  const breadcrumbs = useBreadcrumbs(
    stickyHeaderVariant,
    TAB_SCHEMA as TabsSchema[],
    context,
  );

  const isPeopleTab = router.asPath.includes(Tab.People);
  const Layout = isPeopleTab ? PageShell.TableLayout : PageShell.Layout;

  const isLegalEntityInitialized = isLEInitialized(context, payGroup);
  const calendar = getActiveCalendar(context, payGroup);
  const configurationAlert =
    isLegalEntityInitialized && getConfigurationAlert(context, calendar);

  const isTransferBlocked =
    peopleData && peopleData.some((person) => person.blockers.length);

  return (
    <PageShell>
      <PageShell.StickyHeader breadcrumbSchema={breadcrumbs}>
        <Inline space="gap-default">
          <RefreshButton
            legalEntityId={legalEntityId}
            isValidConfiguration={!configurationAlert}
          />
          <TransferButton
            configurationInvalid={!!configurationAlert}
            isTransferBlocked={isTransferBlocked}
            transferState={context?.xeroContext?.transfer}
          />
        </Inline>
      </PageShell.StickyHeader>
      <PageHeader
        stickyHeaderObserver={stickyHeaderObserver}
        setStickyHeaderVariant={setStickyHeaderVariant}
      >
        {configurationAlert ? (
          configurationAlert
        ) : (
          <>
            <PayPeriodWidget
              calendar={calendar}
              payRunsRedirectLink={
                context?.xeroContext?.redirectUrls.payRunOverview
              }
            />
            <LastRefreshBanner updatedAt={peopleDataUpdatedAt} />
            <TransferStatusBanner
              transferState={context?.xeroContext?.transfer}
            />
            <PayrollTabs
              tabSchema={TAB_SCHEMA}
              stickyHeaderObserver={stickyHeaderObserver}
              onStickyChange={(stuck: boolean) => {
                setStickyHeaderVariant((prevState) => {
                  if (stuck) {
                    return 'full';
                  }

                  return prevState === 'full' ? 'title' : 'none';
                });
              }}
            />
          </>
        )}
      </PageHeader>
      <Layout>{!configurationAlert && children}</Layout>
    </PageShell>
  );
};

export default AppLayout;
