import { type FC } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import { type InfoPicker } from './Pickers/types';

export const TabsBar: FC<InfoPicker> = ({
  tabsDefinition,
  handler,
}: TabBarProps) => {
  return (
    <Tabs defaultValue={handler.currentTab}>
      <Tabs.List>
        {tabsDefinition.map((tab) => (
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
