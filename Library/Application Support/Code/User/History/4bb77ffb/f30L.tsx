import {
  type InfoItem,
  type InfoPicker,
} from '../../components/Layout/Pickers/types';
import { useLegalEntities } from '../useLegalEntities';
import { useLegalEntitiesNavigator } from '../navigators/useLegalEntityNavigator';

export const useLegalEntitiesPicker = (): InfoPicker => {
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
