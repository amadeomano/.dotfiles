import {
  type InfoItem,
  type InfoPicker,
} from '../../components/temp-layout/Pickers/types';
import { useLegalEntities } from '../useLegalEntities';
import {
  tabsDefinition,
  useTabNavigator,
} from '../navigators/useTabsNavigator';

export const useTabsPicker = (): InfoPicker => {
  const { legalEntities } = useLegalEntities();
  const { getActiveLegalEntity, navigateToLegalEntity } =
    useLegalEntitiesNavigator();

  const list = tabsDefinition.map<InfoItem>(({ route, label }) => ({
    key: id,
    label: name,
  }));

  return {
    list,
    onSelect: navigateToLegalEntity,
    selected: getActiveLegalEntity() ?? '',
    placeholder: 'Select a Legal Entity',
  };
};
