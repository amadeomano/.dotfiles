import { Title } from 'designSystem/component/page-layout';
import { Select } from 'designSystem/component/select';
import { type InfoPicker } from './types';

export const LegalEntitiesPicker = ({
  list,
  selected,
  onSelect,
  placeholder,
}: InfoPicker) => {
  return (
    <Title.Accessory>
      <Select variant="ghost" value={selected} onValueChange={onSelect}>
        <Select.TriggerValue placeholder={placeholder} />
        <Select.Viewport>
          {list.map(({ key, label }) => (
            <Select.Item key={key} value={key}>
              {label}
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select>
    </Title.Accessory>
  );
};
