import { Tabs } from 'designSystem/component/tabs';

export type TabDefinition = {
  id: string;
  label: string;
  count?: number;
  onClick: string;
};

type TabBarProps = { tabsDefinition: TabDefinition[]; selectedId?: string };
export const TabsBar = ({ tabsDefinition, selectedId }: TabBarProps) => {
  return (
    <Tabs defaultValue={selectedId}>
      <Tabs.List>
        {tabsDefinition.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            data-test-id={`payroll-${tab.id}`}
            value={tab.id}
            count={tab.count}
            onClick={() => navigateTo(tab.href)}
          >
            {tab.label(t as TFunction<T>)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
