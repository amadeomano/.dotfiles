import { MouseEvent } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { DevelopmentHelperTab } from './ManageTab/DevelopmentHelperTab';
import { ListPensionSchemas } from './ManageTab/PensionSchemasSettings/ListPensionSchemas';

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
      </TertiaryNavigation>
      <main>
        {routeComponents[
          getActiveRoute(router, routeComponents) ?? 'manage/dev'
        ]()}
      </main>
    </Inline>
  );
};
