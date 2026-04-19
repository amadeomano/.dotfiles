import { Title } from 'designSystem/component/page-layout';
import { Select } from 'designSystem/component/select';
import { InfoItem, type InfoPicker } from './types';
import { useLegalEntities } from '../../../hooks/useLegalEntities';

export const LegalEntitiesPicker = ({
  list,
  selected,
  onSelect,
  placeholder,
}: InfoPicker) => {
  return (
    <Title.Accessory>
      <Select variant="ghost" onValueChange={onSelect}>
        <Select.TriggerValue placeholder={legalEntities?.placeholder} />
        <Select.Viewport>
          {legalEntities?.list.map(({ key, label }) => (
            <Select.Item key={key} value={key}>
              {label}
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select>
    </Title.Accessory>
  );
};
