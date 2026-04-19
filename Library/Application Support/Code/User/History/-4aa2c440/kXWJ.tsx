import { type FC, type MouseEvent } from 'react';
import { useRouter, type NextRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { DevelopmentHelperTab } from './DevelopmentHelperTab';
import { ListPensionSchemas } from './PensionSchemasSettings/ListPensionSchemes';
import { CompensationTab } from './CompensationTab/CompensationTab';
import { LegalEntitySettingsTab } from './LegalEntitySettingsTab';
import { ManagePayGroups } from './ManagePayGroups/ManagePayGroups';

import {
  type ManageRoute,
  managePages,
  useManageTabNavigator,
} from './useManageTabNavigator';

const routeTitles: { [key in ManageRoute]: string } = {
  'legal-entity': 'Legal entity attributes',
  'pay-groups': 'Pay groups',
  compensations: 'Compensations',
  pension: 'Pension schemas',
  dev: 'Development helpers',
};

const getHrefToSlug = (href: string) => {
  const trimmedHref = href.replace(location.origin, '');
  const slugs = trimmedHref.split('/').filter(Boolean);
  return slugs;
};

const getActiveRoute = (
  router: NextRouter,
  boundary: Record<string, unknown>,
) => {
  const currentRoute = (router.query.slug as string[] | undefined)?.join('/');
  if (!currentRoute) return undefined;
  const matchedRoute =
    boundary &&
    Object.keys(boundary).find((route) => currentRoute.match(route));
  return matchedRoute;
};

const routeComponents: Record<string, FC> = {
  'manage/legal-entity-attributes': LegalEntitySettingsTab,
  'manage/compensations': CompensationTab,
  'manage/pension': ListPensionSchemas,
  'manage/dev': DevelopmentHelperTab,
  'manage/pay-groups': ManagePayGroups,
};

const getRouteComponent = (router: NextRouter) =>
  routeComponents[
    getActiveRoute(router, routeComponents) ?? 'manage/legal-entity-attributes'
  ];

export const ManageTab = () => {
  const { isRouteSelected } = useManageTabNavigator();
  const router = useRouter();
  const handleNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push({
      query: { ...router.query, slug: getHrefToSlug(e.currentTarget.href) },
    });
  };
  const RouteComponent = getRouteComponent(router);

  return (
    <Inline>
      <aside style={{ minWidth: 200 }}>
        <TertiaryNavigation>
          {Object.keys(managePages).map((route) => (
            <TertiaryNavigation.Item
              key={route}
              href={`/manage/${route}`}
              selected={isRouteSelected(route as ManageRoute)}
              onClick={handleNavigation}
            >
              {routeTitles[route as ManageRoute]}
            </TertiaryNavigation.Item>
          ))}
        </TertiaryNavigation>
      </aside>
      <main style={{ flexGrow: 1 }}>
        <RouteComponent />
      </main>
    </Inline>
  );
};
