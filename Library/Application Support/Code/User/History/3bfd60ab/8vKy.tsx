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

  const list = Object.values(legalEntities).map<InfoItem>(({ id, name }) => ({
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
