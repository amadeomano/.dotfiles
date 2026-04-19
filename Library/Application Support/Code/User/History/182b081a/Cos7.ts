import { type ComponentType } from 'react';
import { type NextRouter, useRouter } from 'next/router';

import { LegalEntitySettingsTab } from './LegalEntitySettingsTab';
import { DevelopmentHelperTab } from './DevelopmentHelperTab';
import { ListPensionSchemas } from './PensionSchemasSettings/ListPensionSchemes';
import { CompensationTab } from './CompensationTab/CompensationTab';
import { ManagePayGroups } from './ManagePayGroups/ManagePayGroups';
import { m } from 'msw/lib/glossary-de6278a9';

type ManagePages = Record<string, ComponentType>;

const isDev = process.env.NODE_ENV === 'development';
const managePages: ManagePages = {
  'legal-entity': LegalEntitySettingsTab,
  'pay-groups': ManagePayGroups,
  compensations: CompensationTab,
  pension: ListPensionSchemas,
  ...(isDev ? { dev: DevelopmentHelperTab } : {}),
};

export const useManageTabNavigator = () => {
  const router = useRouter();
  const routeName = router.query.slug?.[1] ?? 'legal-entity';
  return { routedPage: <managePages[routeName] /> };
};
