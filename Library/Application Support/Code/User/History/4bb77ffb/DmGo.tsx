import { useLegalEntities } from '../../../hooks/useLegalEntities';
import { TitleAccessoryPicker } from './TitleAccessoryPicker';
import { type InfoItem } from './types';

export const LegalEntitiesPicker = () => {
  const { legalEntities } = useLegalEntities();
};
