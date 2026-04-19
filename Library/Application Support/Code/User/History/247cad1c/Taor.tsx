import { PageShell } from 'designSystem/component/page-shell';
import { Tabs } from 'designSystem/component/tabs';
import type { TFunction } from 'i18next';
import { useRouter } from 'next/router';
import React, { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { extractCurrentPayrollRoute } from '../../../../utils';
import { useBreadcrumbs } from '../../context';
import { HubActionsBar } from '../HubActionsBar/HubActionsBar';
import styles from './HubHeader.module.scss';
import { PayrollPeriodNavigator } from './components/PayrollPeriodNavigator/PayrollPeriodNavigator';

export type PayrollHubTabDefinition<
  T extends 'payroll' | 'payroll-integrations',
> = {
  route: string;
  href: string;
  label: (t: TFunction<T>) => string;
  suffixMetadata?: (t: TFunction<T>) => string;
};

type PayrollHubLayoutArgs<T extends 'payroll' | 'payroll-integrations'> = {
  title: string;
  tabsDefinition: PayrollHubTabDefinition<T>[];
  usesPeriodNavigator?: boolean;
  namespace: T;
  // TODO: remove prop once all payroll products are using Page.Hierarchical
  usesPage?: boolean;
};

const StickyHeader = function () {
  const breadcrumbs = useBreadcrumbs();
  return (
    <PageShell.StickyHeader breadcrumbSchema={breadcrumbs}>
      <HubActionsBar />
    </PageShell.StickyHeader>
  );
};

const HeaderBase = <T extends 'payroll' | 'payroll-integrations'>({
  title,
  usesPeriodNavigator,
  children,
}: PropsWithChildren<
  Pick<Partial<PayrollHubLayoutArgs<T>>, 'title' | 'usesPeriodNavigator'>
>) => {
  if (!title) return null;

  return (
    <>
      <div>
        <h1>{title}</h1>
      </div>
      <div className={styles.periodNavigatorSection}>
        {usesPeriodNavigator && <PayrollPeriodNavigator />}
        <div>{children}</div>
      </div>
    </>
  );
};

function DynamicHubHeader({ children }: PropsWithChildren) {
  const router = useRouter();
  const currentRoute = extractCurrentPayrollRoute(router.asPath);
  return (
    <PageShell.Header>
      <div key={currentRoute} className={styles.hubHeader}>
        {children}
      </div>
    </PageShell.Header>
  );
}

const TabsList = <T extends 'payroll' | 'payroll-integrations'>({
  tabsDefinition,
  namespace,
}: Pick<Partial<PayrollHubLayoutArgs<T>>, 'tabsDefinition'> &
  Pick<PayrollHubLayoutArgs<T>, 'namespace'>) => {
  const { t } = useTranslation(namespace);
  const router = useRouter();

  if (!tabsDefinition) return null;

  const currentRoute =
    extractCurrentPayrollRoute(router.asPath) || tabsDefinition[0].route;

  const hydrateHrefWithQueryParams = (href: string) => {
    const query = new URLSearchParams(router.query as Record<string, string>);
    query.delete('slug');
    const queryParams = query.toString();
    if (queryParams) return `${href}?${queryParams}`;
    return href;
  };

  const navigateTo = (href: string) => {
    router.push(hydrateHrefWithQueryParams(href), undefined, { shallow: true });
  };
  const key = router.query.period?.toString();

  return (
    <div key={key}>
      {tabsDefinition.length > 0 ? (
        <Tabs defaultValue={currentRoute}>
          <Tabs.List>
            {tabsDefinition.map((tab) => (
              <Tabs.Trigger
                key={tab.href}
                data-test-id={`payroll-${tab.route}`}
                value={tab.href}
                count={
                  !tab.suffixMetadata
                    ? undefined
                    : (tab.suffixMetadata(
                        t as TFunction<T>,
                      ) as unknown as number)
                }
                onClick={() => navigateTo(tab.href)}
              >
                {tab.label(t as TFunction<T>)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      ) : null}
    </div>
  );
};

type HubHeaderRawProps<T extends 'payroll' | 'payroll-integrations'> =
  PropsWithChildren<Partial<PayrollHubLayoutArgs<T>>>;

const HubHeaderRaw = <T extends 'payroll' | 'payroll-integrations'>({
  children,
  tabsDefinition,
  title,
  usesPeriodNavigator = true,
  namespace = 'payroll' as T,
}: HubHeaderRawProps<T>) => {
  /**
   * If you feel the need to have custom section using one of the components base (eg HeaderBase)
   * we will need to replace this function for a context to avoid prop-drilling
   */
  const cloneChildrenWithProps = (child: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return React.cloneElement<any>(child, { title, usesPeriodNavigator });
  };

  const childs = children || [
    <HeaderBase title={title} usesPeriodNavigator={usesPeriodNavigator} />,
  ];

  const hydratedChildren = React.Children.map(childs, cloneChildrenWithProps);

  return (
    <>
      <StickyHeader />
      <DynamicHubHeader>
        {hydratedChildren}
        <TabsList tabsDefinition={tabsDefinition} namespace={namespace} />
      </DynamicHubHeader>
    </>
  );
};

type HubHeaderType = typeof HubHeaderRaw & {
  Base: typeof HeaderBase;
};

export const HubHeader = HubHeaderRaw as HubHeaderType;
HubHeader.Base = HeaderBase;
