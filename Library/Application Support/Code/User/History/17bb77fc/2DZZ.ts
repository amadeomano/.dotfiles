import { useCallback, useEffect, type FC } from 'react';
import { useRouter, type NextRouter } from 'next/router';
import { DocumentsTab } from '../../tabs/DocumentsTab/DocumentsTab';
import { ManageTab } from '../../tabs/ManageTab/ManageTab';
import { PeopleTab } from '../../tabs/PeopleTab/PeopleTab';
import { PayRunsTab } from '../../tabs/PayRunsTab/PayRunsTab';
import { ProcessTab } from '../../tabs/ProcessTab/ProcessTab';

type TabName = keyof typeof tabs;
type NavigateTo = (to: string) => void;
type UseTabNavigatorReturn = {
  currentTab?: TabName;
  navigateTo: NavigateTo;
  TabComponent: FC;
};

const LANDING_TAB: TabName = 'payruns';

const tabs = {
  payruns: {
    route: 'payruns',
    href: '/payroll/payruns',
    label: 'Payroll Runs',
    component: PayRunsTab,
  },
  personal: {
    route: 'people',
    href: '/payroll/people',
    label: 'People',
    component: PeopleTab,
  },
  process: {
    route: 'process',
    href: '/payroll/process',
    label: 'Process',
    component: ProcessTab,
  },
  documents: {
    route: 'documents',
    href: '/payroll/documents',
    label: 'Documents',
    component: DocumentsTab,
  },
  manage: {
    route: 'manage',
    href: '/payroll/manage',
    label: 'Manage',
    component: ManageTab,
  },
};
export const tabsDefinition = Object.values(tabs);

const getTabName = (source: string | undefined): TabName | undefined => {
  if (!source) return undefined;
  return source in tabs ? (source as TabName) : undefined;
};

export const getQueryWithNewTab = (
  query: NextRouter['query'],
  to: string,
): NextRouter['query'] => ({
  ...query,
  slug: [to],
});

const navigate =
  (router: NextRouter): NavigateTo =>
  (to) =>
    router.replace({ query: getQueryWithNewTab(router.query, to) });

export const useTabNavigator = (): UseTabNavigatorReturn => {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navigateTo = useCallback(navigate(router), [router.query]);
  const currentTab = getTabName(router.query.slug?.[0]);

  useEffect(() => {
    if (!currentTab) navigateTo(LANDING_TAB);
  }, [currentTab, navigateTo]);

  const TabComponent =
    currentTab && tabs[currentTab]
      ? tabs[currentTab].component
      : tabs[LANDING_TAB].component;

  return {
    currentTab,
    navigateTo,
    TabComponent,
  };
};
