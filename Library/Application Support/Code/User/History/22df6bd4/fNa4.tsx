import { type PayrollHubTabDefinition } from '../../../../components/PayrollHubLayout/components/HubHeader/HubHeader';
import { Tabs } from 'designSystem/component/tabs';

type TabBarProps = {
  tabsDefinition: PayrollHubTabDefinition<'payroll'>[];
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
