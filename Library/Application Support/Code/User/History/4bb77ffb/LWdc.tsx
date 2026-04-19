import { type FC } from 'react';
import { TitleAccessoryPicker } from './temp-layout/Pickers/TitleAccessoryPicker';
import { type InfoItem } from './temp-layout/Pickers/types';
import { useLegalEntities } from '../hooks/useLegalEntities';
import { useLegalEntitiesNavigator } from '../hooks/navigators/useLegalEntityNavigator';

export const LegalEntitiesPicker: FC = () => {
  const { legalEntities } = useLegalEntities();
  const { getActiveLegalEntity, navigateToLegalEntity } =
    useLegalEntitiesNavigator();

  const list = Object.values(legalEntities).map<InfoItem>(({ id, name }) => ({
    key: id,
    label: name,
  }));

  return (
    <TitleAccessoryPicker
      list={list}
      onSelect={navigateToLegalEntity}
      selected={getActiveLegalEntity() ?? ''}
    />
  );
};
