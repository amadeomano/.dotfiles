import { type ComponentType } from 'react';
import { type NextRouter, useRouter } from 'next/router';

import { LegalEntitySettingsTab } from './LegalEntitySettingsTab';
import { DevelopmentHelperTab } from './DevelopmentHelperTab';
import { ListPensionSchemas } from './PensionSchemasSettings/ListPensionSchemes';
import { CompensationTab } from './CompensationTab/CompensationTab';
import { ManagePayGroups } from './ManagePayGroups/ManagePayGroups';

export type ManageRoute = keyof typeof managePages;

const isDev = process.env.NODE_ENV === 'development';
export const managePages = {
  'legal-entity': LegalEntitySettingsTab,
  'pay-groups': ManagePayGroups,
  compensations: CompensationTab,
  pension: ListPensionSchemas,
  ...(isDev ? { dev: DevelopmentHelperTab } : {}),
};

const getRouteName = (
  router: NextRouter,
  fallback: ManageRoute = 'legal-entity',
): ManageRoute => {
  const urlSlug = router.query.slug?.[1];
  return urlSlug !== undefined && urlSlug in managePages
    ? (urlSlug as ManageRoute)
    : fallback;
};

const getRoutePage = (routeName: ManageRoute): ComponentType =>
  managePages[routeName] as ComponentType;

const isRouteSelected = (router: NextRouter) => (routeName: ManageRoute) =>
  getRouteName(router) === routeName;

const navigateTo = (router: NextRouter) => (routeName: ManageRoute) =>
  router.push({ query: { slug: ['manage', routeName] } });

export const useManageTabNavigator = () => {
  const router = useRouter();
  const routeName = getRouteName(router);
  const RoutedPage = getRoutePage(routeName);

  return { RoutedPage, isRouteSelected: isRouteSelected(router) };
};
