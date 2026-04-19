import { type FC } from 'react';
import { Title } from 'designSystem/component/page-layout';
import { Select } from 'designSystem/component/select';
import { type InfoPicker } from '../types';

const getValueById = (list: InfoPicker['list'], id: string, default?: string) => list.find(itm => itm.key === id)?.label ?? default;

export const LegalEntityPicker: FC<InfoPicker> = ({
  list,
  selected,
  onSelect,
  placeholder,
}) => {
  return (
    <Title.Accessory>
      <Select variant="ghost" value={selected} onValueChange={onSelect}>
        <Select.TriggerValue
          placeholder={placeholder}
          aria-label={placeholder}
        />
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

LegalEntityPicker.displayName = 'Title.Accessory';
