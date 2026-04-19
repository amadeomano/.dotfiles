import React, { FC, PropsWithChildren, MouseEvent } from 'react';
import { PageShell } from 'designSystem/component/page-shell';
import { useRouter } from 'next/router';

import { useTranslation } from 'react-i18next';
import { Tabs } from 'designSystem/component/tabs';

import { extractCurrentPayrollRoute } from '../../../../utils';
import { useBreadcrumbs } from '../../context';
import type { Namespace, TFunction } from 'i18next';

import { HubActionsBar } from '../HubActionsBar/HubActionsBar';
import styles from './HubHeader.module.scss';
import { PayrollPeriodNavigator } from './components/PayrollPeriodNavigator/PayrollPeriodNavigator';

type PayrollHubLayoutArgs = {
  title: string;
  tabsDefinition: {
    route: string;
    href: string;
    label: (t: TFunction<Namespace>) => string;
  }[];
};

const StickyHeader = function () {
  const breadcrumbs = useBreadcrumbs();
  return (
    <PageShell.StickyHeader breadcrumbSchema={breadcrumbs}>
      <HubActionsBar />
    </PageShell.StickyHeader>
  );
};

const HeaderBase = ({
  title,
}: Pick<Partial<PayrollHubLayoutArgs>, 'title'>) => {
  if (!title) return null;

  return (
    <>
      <div>
        <h1>{title}</h1>
      </div>
      <div>
        <PayrollPeriodNavigator />
      </div>
    </>
  );
};

function DynamicHubHeader({ children }: PropsWithChildren) {
  const router = useRouter();

  return (
    <PageShell.Header>
      <div key={router.asPath} className={styles.hubHeader}>
        {children}
      </div>
    </PageShell.Header>
  );
}

const TabsList = ({
  tabsDefinition,
}: Pick<Partial<PayrollHubLayoutArgs>, 'tabsDefinition'>) => {
  const { t } = useTranslation('payroll');
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

  const handleTabClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const anchor = e.currentTarget as unknown as HTMLAnchorElement;
    console.log(anchor.href);
  };

  return (
    <div>
      {tabsDefinition.length > 0 ? (
        <Tabs defaultValue={currentRoute}>
          <Tabs.List>
            {tabsDefinition.map((tab) => (
              <Tabs.Trigger
                key={tab.href}
                value={tab.href}
                href={hydrateHrefWithQueryParams(tab.href)}
                onClick={handleTabClick}
              >
                {tab.label(t)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      ) : null}
    </div>
  );
};

const HubHeaderRaw: FC<PropsWithChildren<Partial<PayrollHubLayoutArgs>>> = ({
  children,
  tabsDefinition,
  title,
}) => {
  /**
   * If you feel the need to have custom section using one of the components base (eg HeaderBase)
   * we will need to replace this function for a context to avoid prop-drilling
   */
  const cloneChildrenWithProps = (child: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return React.cloneElement<any>(child, { title });
  };

  const childs = children || [<HeaderBase title={title} />];

  const hydratedChildren = React.Children.map(childs, cloneChildrenWithProps);

  return (
    <>
      <StickyHeader />
      <DynamicHubHeader>
        {hydratedChildren}
        <TabsList tabsDefinition={tabsDefinition} />
      </DynamicHubHeader>
    </>
  );
};

type HubHeaderType = typeof HubHeaderRaw & {
  Base: typeof HeaderBase;
};

export const HubHeader = HubHeaderRaw as HubHeaderType;
HubHeader.Base = HeaderBase;
