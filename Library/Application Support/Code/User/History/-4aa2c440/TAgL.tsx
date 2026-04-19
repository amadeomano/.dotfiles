import { type FC, type MouseEvent } from 'react';
import { useRouter, type NextRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { DevelopmentHelperTab } from './DevelopmentHelperTab';
import { ListPensionSchemas } from './PensionSchemasSettings/ListPensionSchemes';
import { CompensationTab } from './CompensationTab/CompensationTab';
import { LegalEntitySettingsTab } from './LegalEntitySettingsTab';

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
};

export const ManageTab = () => {
  const router = useRouter();
  const handleNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push({
      query: { ...router.query, slug: getHrefToSlug(e.currentTarget.href) },
    });
  };

  const is_dev = process.env.NODE_ENV === 'development';

  const RouteComponent =
    routeComponents[
      getActiveRoute(router, routeComponents) ??
        'manage/legal-entity-attributes'
    ];

  return (
    <Inline>
      <aside style={{ minWidth: 200 }}>
        <TertiaryNavigation>
          <TertiaryNavigation.Item
            href="/manage/legal-entity-attributes"
            selected={
              getActiveRoute(router, routeComponents) ===
              'manage/legal-entity-attributes'
            }
            onClick={handleNavigation}
          >
            Legal entity attributes
          </TertiaryNavigation.Item>
          <TertiaryNavigation.Item
            href="/manage/compensations"
            selected={
              getActiveRoute(router, routeComponents) === 'manage/compensations'
            }
            onClick={handleNavigation}
          >
            Compensations
          </TertiaryNavigation.Item>
          <TertiaryNavigation.Item
            href="/manage/pension"
            selected={
              getActiveRoute(router, routeComponents) === 'manage/pension'
            }
            onClick={handleNavigation}
          >
            Pension schemas
          </TertiaryNavigation.Item>
          {is_dev && (
            <TertiaryNavigation.Item
              href="/manage/dev"
              selected={
                getActiveRoute(router, routeComponents) === 'manage/dev'
              }
              onClick={handleNavigation}
            >
              Development helpers
            </TertiaryNavigation.Item>
          )}
        </TertiaryNavigation>
      </aside>
      <main style={{ flexGrow: 1 }}>{RouteComponent}</main>
    </Inline>
  );
};
