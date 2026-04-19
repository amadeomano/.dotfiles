import { MouseEvent } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { DevelopmentHelperTab } from './ManageTab/DevelopmentHelperTab';
import { PensionSchemasSettings } from './ManageTab/PensionSchemasSettings';

const getHrefToSlug = (href: string) => {
  const trimmedHref = href.replace(location.origin, '');
  const slugs = trimmedHref.split('/').filter(Boolean);
  return slugs;
};

const getActiveRoute = (
  router: NextRouter,
  boundary?: Record<string, unknown>,
) => {
  const currentRoute = (router.query.slug as string[] | undefined)?.join('/');
  if (!currentRoute) return undefined;
  const matchedRoute =
    boundary &&
    Object.keys(boundary).find((route) => currentRoute.match(route));
  return currentRoute;
};
