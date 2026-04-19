import { type FC } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import { type InfoPicker } from './types';

export const TabPickerBar: FC<InfoPicker> = ({ list, selected, onSelect }) => {
  return (
    <Tabs defaultValue={selected}>
      <Tabs.List>
        {list.map(({ key, label, count }) => (
          <Tabs.Trigger
            key={key}
            data-test-id={`payroll-${key}`}
            value={key}
            count={count}
            onClick={() => onSelect(key)}
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
