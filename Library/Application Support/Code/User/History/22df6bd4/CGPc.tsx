import { Tabs } from 'designSystem/component/tabs';

export type TabDefinition = {
  id: string;
  label: string;
  onClick: string;
};

type TabBarProps = { tabsDefinition: TabDefinition[]; selectedId?: string };
export const TabsBar = ({ tabsDefinition, selectedId }: TabBarProps) => {
  return (
    <Tabs defaultValue={selectedId}>
      <Tabs.List>
        {tabsDefinition.map((tab) => (
          <Tabs.Trigger
            key={tab.href}
            data-test-id={`payroll-${tab.route}`}
            value={tab.href}
            count={
              !tab.suffixMetadata
                ? undefined
                : (tab.suffixMetadata(t as TFunction<T>) as unknown as number)
            }
            onClick={() => navigateTo(tab.href)}
          >
            {tab.label(t as TFunction<T>)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
