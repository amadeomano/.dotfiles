import { type PayrollHubTabDefinition } from '../../../../components/PayrollHubLayout/components/HubHeader/HubHeader';
import { Tabs } from 'designSystem/component/tabs';

export type TabDef = PayrollHubTabDefinition<'payroll'> & {
  text: string;
  count?: number;
};
type TabBarProps = {
  tabsDefinition: TabDef[];
  selectedHref?: string;
  onSelect: (href: string) => void;
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
            onClick={() => onSelect(tab.href)}
          >
            {tab.text}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
