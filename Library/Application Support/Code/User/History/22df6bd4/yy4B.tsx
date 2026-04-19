import { type PayrollHubTabDefinition } from '../../../../components/PayrollHubLayout/components/HubHeader/HubHeader';
import { Tabs } from 'designSystem/component/tabs';

export type TabDef = Omit<PayrollHubTabDefinition<'payroll'>, 'label'> & {
  label: string;
  count?: number;
};
type TabBarProps = {
  tabsDefinition: TabDef[];
  selectedHref?: string;
  onSelect: (route: string) => void;
};

export const TabsBar = ({
  tabsDefinition,
  selectedHref: selectedId,
  onSelect,
}: TabBarProps) => {
  return (
    <Tabs defaultValue={selectedId}>
      <Tabs.List>
        {tabsDefinition.map((tab) => (
          <Tabs.Trigger
            key={tab.href}
            data-test-id={`payroll-${tab.route}`}
            value={tab.href}
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
