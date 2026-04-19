import { MouseEvent } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { DevelopmentHelperTab } from './ManageTab/DevelopmentHelperTab';

const getHrefToSlug = (href: string) => {
  const trimmedHref = href.replace(location.origin, '');
  const slugs = trimmedHref.split('/').filter(Boolean);
  return slugs;
};

const getActiveRoute = (
  router: NextRouter,
  boundary?: Record<string, unknown>,
) => {
  const lastSlug = router.query.slug?.slice(-1)[0];
};

const routeComponents = {
  dev: DevelopmentHelperTab,
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
          selected={getActiveRoute(router) === 'dev'}
          onClick={handleNavigation}
        >
          Development helpers
        </TertiaryNavigation.Item>
      </TertiaryNavigation>
      <main>{routeComponents[getActiveRoute(router)]}</main>
    </Inline>
  );
};
