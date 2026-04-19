import {
  type InfoItem,
  type InfoPicker,
} from '../../components/PayrollSidePanel/Pickers/types';
import {
  tabsDefinition,
  useTabNavigator,
} from '../navigators/useTabsNavigator';

export const useTabsPicker = (): InfoPicker => {
  const { currentTab, navigateTo } = useTabNavigator();

  const list = tabsDefinition.map<InfoItem>(({ route, label }) => ({
    key: route,
    label,
    count: route === 'payruns' ? 10 : undefined,
  }));

  return {
    list,
    onSelect: navigateTo,
    selected: currentTab ?? '',
  };
};
