import { type FC } from 'react';
import { useLegalEntities } from '../hooks/useLegalEntities';
import { TitleAccessoryPicker } from './temp-layout/Pickers/TitleAccessoryPicker';
import { type InfoItem } from './temp-layout/Pickers/types';

export const LegalEntitiesPicker: FC = () => {
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
