import { type PayrollHubTabDefinition } from '../../../../components/PayrollHubLayout/components/HubHeader/HubHeader';
import { Tabs } from 'designSystem/component/tabs';

export type TabDef = Omit<PayrollHubTabDefinition<'payroll'>, 'label'> & {
  label: string;
  count?: number;
};
type TabBarProps = {
  tabsDefinition: TabDef[];
  handler: {
    currentTab?: string;
    navigate: (route: string) => void;
  };
};

export const TabsBar = ({
  tabsDefinition,
  selectedRoute,
  onSelect,
}: TabBarProps) => {
  return (
    <Tabs defaultValue={selectedRoute}>
      <Tabs.List>
        {tabsDefinition.map((tab) => (
          <Tabs.Trigger
            key={tab.route}
            data-test-id={`payroll-${tab.route}`}
            value={tab.route}
            count={tab.count}
            onClick={() => onSelect(tab.route)}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
