import {
  type InfoItem,
  type InfoPicker,
} from '../../components/temp-layout/Pickers/types';
import {
  tabsDefinition,
  useTabNavigator,
} from '../navigators/useTabsNavigator';

export const useTabsPicker = (): InfoPicker => {
  const { currentTab, navigateTo } = useTabNavigator();

  const list = tabsDefinition.map<InfoItem>(({ route, label }) => ({
    key: route,
    label,
  }));

  return {
    list,
    onSelect: navigateTo,
    selected: currentTab ?? '',
  };
};
