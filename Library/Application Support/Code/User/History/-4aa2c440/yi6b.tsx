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

export const ManageTab = () => {
  const { isRouteSelected, RoutedPage } = useManageTabNavigator();

  return (
    <Inline>
      <aside style={{ minWidth: 200 }}>
        <TertiaryNavigation>
          {Object.keys(managePages).map((route: ManageRoute) => (
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
        <RoutedPage />
      </main>
    </Inline>
  );
};
