import { type ComponentType } from 'react';
import { type NextRouter, useRouter } from 'next/router';

import { LegalEntitySettingsTab } from './LegalEntitySettingsTab';
import { DevelopmentHelperTab } from './DevelopmentHelperTab';
import { ListPensionSchemas } from './PensionSchemasSettings/ListPensionSchemes';
import { CompensationTab } from './CompensationTab/CompensationTab';
import { ManagePayGroups } from './ManagePayGroups/ManagePayGroups';

type ManagePage = keyof typeof managePages;

const isDev = process.env.NODE_ENV === 'development';
const managePages = {
  'legal-entity': LegalEntitySettingsTab,
  'pay-groups': ManagePayGroups,
  compensations: CompensationTab,
  pension: ListPensionSchemas,
  ...(isDev ? { dev: DevelopmentHelperTab } : {}),
};

const getHrefToSlug = (router: NextRouter) => (href: string) => {
  const trimmedHref = href.replace(router.basePath, '');
  const slugs = trimmedHref.split('/').filter(Boolean);
  return slugs;
};

const getHref = (route: keyof typeof managePages) => {
  const trimmedHref = href.replace(router.basePath, '');
  const slugs = trimmedHref.split('/').filter(Boolean);
  return slugs;
};

export const useManageTabNavigator = () => {
  const router = useRouter();
  const routeName = router.query.slug?.[1] ?? 'legal-entity';
  const RoutedPage = managePages[routeName] as ComponentType;

  return { RoutedPage };
};
