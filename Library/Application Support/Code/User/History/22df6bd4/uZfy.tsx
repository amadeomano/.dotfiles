export type TabDefinition = {
  label: string;
  onClick: string;
};

type TabBarProps = { tabsDefinition: TabDefinition[] };
export const TabsBar = ({ tabsDefinition }: TabBarProps) => {
  return (
      {tabsDefinition.length > 0 ? (
        <Tabs defaultValue={currentRoute}>
          <Tabs.List>
            {tabsDefinition.map((tab) => (
              <Tabs.Trigger
                key={tab.href}
                data-test-id={`payroll-${tab.route}`}
                value={tab.href}
                count={
                  !tab.suffixMetadata
                    ? undefined
                    : (tab.suffixMetadata(
                        t as TFunction<T>,
                      ) as unknown as number)
                }
                onClick={() => navigateTo(tab.href)}
              >
                {tab.label(t as TFunction<T>)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      ) : null}
  );
};
