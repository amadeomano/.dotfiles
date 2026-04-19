import { useRouter } from 'next/router';
import { BreadcrumbSchemaItem } from '@personio-web/design-system-component-page-shell-types';
import { TabsSchema } from '../../../../types/TabSchema';
import { BASE_PATH } from '../../../../constants';

export const computeCurrentTab = (
  tabSchema: TabsSchema[],
  pathname: string,
): TabsSchema | undefined => {
  if (BASE_PATH === pathname) {
    return tabSchema[0];
  }

  return tabSchema.find((tab) => pathname.includes(tab.href));
};

export const useTabsBreadcrumb = (
  tabSchema: TabsSchema[],
): BreadcrumbSchemaItem | null => {
  const router = useRouter();
  const currentTab = computeCurrentTab(tabSchema, router.pathname);

  if (!currentTab) {
    return null;
  }

  return {
    id: 'tabs',
    label: currentTab.label,
  };

  // TODO [Tabs]: re-enable
  // return {
  //   id: 'tabs',
  //   label: currentTab.label,
  //   dropdownItems: tabSchema.map((tab) => {
  //     return {
  //       id: tab.href,
  //       label: tab.label,
  //       onClick: () => navigate({ route: tab.href }),
  //     };
  //   }),
  // };
};
