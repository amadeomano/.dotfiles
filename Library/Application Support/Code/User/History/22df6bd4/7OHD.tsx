export type TabDefinition = {
  label: string;
  onClick: string;
};

type TabBarProps = { tabsDefinition: TabDefinition[] };
export const TabsBar = ({ tabsDefinition }: TabBarProps) => {
  const currentRoute =
    extractCurrentPayrollRoute(router.asPath) || tabsDefinition[0].route;

  const hydrateHrefWithQueryParams = (href: string) => {
    const query = new URLSearchParams(router.query as Record<string, string>);
    query.delete('slug');
    const queryParams = query.toString();
    if (queryParams) return `${href}?${queryParams}`;
    return href;
  };

  const navigateTo = (href: string) => {
    router.push(hydrateHrefWithQueryParams(href), undefined, { shallow: true });
  };
  const key = router.query.period?.toString();

  return (
    <div key={key}>
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
    </div>
  );
};
