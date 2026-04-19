import { type PayrollHubTabDefinition } from '../../../../components/PayrollHubLayout/PayrollHubLayout';
import { Tabs } from 'designSystem/component/tabs';

type TabBarProps = {
  tabsDefinition: TabDefinition[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export const TabsBar = ({
  tabsDefinition,
  selectedId,
  onSelect,
}: TabBarProps) => {
  return (
    <Tabs defaultValue={selectedId}>
      <Tabs.List>
        {tabsDefinition.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            data-test-id={`payroll-${tab.id}`}
            value={tab.id}
            count={tab.count}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
