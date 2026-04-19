import React, { useState } from 'react';
import { PageShell } from 'designSystem/component/page-shell';
import { Inline } from 'designSystem/component/layout';
import { usePayrollContextData } from '@personio-web/payroll-data-payroll-integration-context';
import type { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { usePeopleData } from '@personio-web/payroll-data-payroll-integration-hub';
import { useStickyHeaderObserver } from '@personio-web/payroll-hook-use-sticky-header';
import { LastRefreshBanner } from '@personio-web/payroll-component-last-refresh-banner';

import { getConfigurationAlert } from './components/ConfigurationAlerts/utils';
import PayrollTabs from './components/PayrollTabs/PayrollTabs';
import TransferButton from './components/StickyHeader/components/TransferButton/TransferButton';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';
import PageHeader from './PageHeader';
import { StickyHeaderVariant } from '../../types/StickyHeaderVariant';
import { TabsSchema } from '../../types/TabSchema';
import { TAB_SCHEMA } from '../../constants';
import { Tab } from '../../types/Tabs';
import usePayrollHubNavigator from '../../hooks/usePayrollHubNavigator';
import { RefreshButton } from './components/RefreshButton/RefreshButton';
import PayPeriodWidget from './components/PayPeriodWidget/PayPeriodWidget';
import { useIsFeatureFlagEnabled } from '../../hooks/useIsFeatureFlagEnabled';
import { FeatureFlag } from '../../types/FeatureFlag';
import { getParams } from '../../utils/navigationParams';

export const isTransferBlocked = (peopleData?: PeopleData[]) =>
  !!peopleData && peopleData.some((person) => person.blockers.length);

const AppLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const {
    pathname,
    params: { legalEntityId },
  } = usePayrollHubNavigator();
  const { data: context } = usePayrollContextData('a3', legalEntityId);
  const { data: peopleData, dataUpdatedAt: peopleDataUpdatedAt } =
    usePeopleData('a3', legalEntityId);

  const showPayPeriod = useIsFeatureFlagEnabled(FeatureFlag.ShowPayrollPeriod);

  const [stickyHeaderVariant, setStickyHeaderVariant] =
    useState<StickyHeaderVariant>('none');

  const stickyHeaderObserver = useStickyHeaderObserver();
  const breadcrumbs = useBreadcrumbs(
    stickyHeaderVariant,
    TAB_SCHEMA as TabsSchema[],
  );

  const isPeopleTab = pathname.includes(Tab.People);
  const Layout = isPeopleTab ? PageShell.TableLayout : PageShell.Layout;

  const configurationAlert = getConfigurationAlert(context);

  return (
    <PageShell>
      <PageShell.StickyHeader breadcrumbSchema={breadcrumbs}>
        <Inline space="gap-default">
          <RefreshButton
            legalEntityId={legalEntityId}
            isValidConfiguration={!configurationAlert}
          />
          <TransferButton
            isTransferBlocked={isTransferBlocked(peopleData)}
            configurationInvalid={!!configurationAlert}
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
            {showPayPeriod && (
              <PayPeriodWidget
                payrollPeriod={context?.a3Context.currentPayPeriod}
              />
            )}
            <LastRefreshBanner updatedAt={peopleDataUpdatedAt} />
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
