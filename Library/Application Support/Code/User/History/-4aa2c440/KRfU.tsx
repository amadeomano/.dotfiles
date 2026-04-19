import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';

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
  const { RoutedPage, isRouteSelected, navigateTo } = useManageTabNavigator();

  return (
    <Inline>
      <aside style={{ minWidth: 200 }}>
        <TertiaryNavigation>
          {Object.keys(managePages).map((route) => (
            <TertiaryNavigation.Item
              key={route}
              href={`/manage/${route}`}
              selected={isRouteSelected(route as ManageRoute)}
              onClick={() => navigateTo(route as ManageRoute)}
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
