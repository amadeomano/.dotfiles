import { type FC } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import { type InfoPicker } from './Pickers/types';

export const TabsBar: FC<InfoPicker> = ({ list, selected, onSelect }) => {
  return (
    <Tabs defaultValue={selected}>
      <Tabs.List>
        {list.map(({ key, label }) => (
          <Tabs.Trigger
            key={tab.route}
            data-test-id={`payroll-${tab.route}`}
            value={tab.route}
            count={tab.count}
            onClick={() => handler.navigateTo(tab.route)}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
