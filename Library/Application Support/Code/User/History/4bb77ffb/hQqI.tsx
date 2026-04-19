import { useLegalEntities } from '../../../hooks/useLegalEntities';
import { TitleAccessoryPicker } from './TitleAccessoryPicker';
import { type InfoItem } from './types';

export const LegalEntitiesPicker = () => {
  const { legalEntities } = useLegalEntities();

  const list = Object.values(legalEntities).map<InfoItem>(({ id, name }) => ({
    key: id,
    label: name,
  }));

  return (
    <TitleAccessoryPicker
      list={list}
      onSelect={console.log}
      selected={list[0]?.key}
    />
  );
};

LegalEntitiesPicker.displayName = 'Title.Accessory';
