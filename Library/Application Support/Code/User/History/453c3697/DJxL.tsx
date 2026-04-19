import { type MouseEvent } from 'react';
import { useRouter, type NextRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { DevelopmentHelperTab } from './ManageTab/DevelopmentHelperTab';
import { ListPensionSchemas } from './ManageTab/PensionSchemasSettings/ListPensionSchemes';
import { CompensationTab } from './ManageTab/CompensationTab/CompensationTab';
import { LegalEntitySettingsTab } from './ManageTab/LegalEntitySettingsTab';

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

const routeComponents = {
  'manage/dev': DevelopmentHelperTab,
  'manage/pension': ListPensionSchemas,
  'manage/legal-entity-attributes': LegalEntitySettingsTab,
  'manage/compensations': CompensationTab,
};

export const ManageTab = () => {
  const router = useRouter();
  const handleNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push({
      query: { ...router.query, slug: getHrefToSlug(e.currentTarget.href) },
    });
  };

  return (
    <Inline>
      <aside style={{ minWidth: 200 }}>
        <TertiaryNavigation>
          <TertiaryNavigation.Item
            href="/manage/dev"
            selected={getActiveRoute(router, routeComponents) === 'manage/dev'}
            onClick={handleNavigation}
          >
            Development helpers
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
        </TertiaryNavigation>
      </aside>
      <main style={{ flexGrow: 1 }}>
        {routeComponents[
          getActiveRoute(router, routeComponents) ??
            ('manage/dev' as keyof typeof routeComponents)
        ]()}
      </main>
    </Inline>
  );
};
