import { createSlots } from '@personio-web/design-system-utils';
import { Slot } from '@personio-web/design-system-utils/src/Slot/Slot';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import {
  Action,
  BreadcrumbNav,
  PageHierarchical,
} from 'designSystem/component/page';

import { getSchemasFn, useBreadcrumbSchema } from './components/breadcrumbs';
import { LegalEntityPicker } from './components/LegalEntityPicker';
import { TabBar } from './components/TabBar';
import { useScrollController } from './hooks/useScrollController';
import { PayrollSidePanel, type SidePanelProps } from './PayrollSidePanel';
import type { PayrollLayoutComponent } from './types';

export const PayrollLayout: PayrollLayoutComponent = ({
  children,
  title,
  legalEntities,
  tabs,
  primaryAction,
  secondaryAction,
  moreActions,
  breadcrumbSchemaFn = getSchemasFn(title, legalEntities, tabs),
}) => {
  const { pageRef, tabsRef, scrolledPast } = useScrollController();
  const { schema } = useBreadcrumbSchema({
    scrolledPast,
    schemasFn: breadcrumbSchemaFn,
  });

  const { slots, rest } = createSlots(children, {
    panel: PayrollSidePanel,
  });
  const panelProps = slots.panel?.props as SidePanelProps | undefined;

  if (primaryAction && typeof primaryAction.isVisible === 'undefined')
    primaryAction.isVisible = true;

  if (secondaryAction && typeof secondaryAction.isVisible === 'undefined')
    secondaryAction.isVisible = true;

  return (
    <PageHierarchical.Root
      pageRef={pageRef}
      panelOpen={panelProps?.isOpen}
      onPanelOpenChange={panelProps?.onClose}
    >
      <PageHierarchical.NavigationBar>
        <BreadcrumbNav breadcrumbSchema={schema} />
        {primaryAction?.isVisible && (
          <Action.Primary {...primaryAction}>
            {primaryAction?.title}
          </Action.Primary>
        )}
        {secondaryAction?.isVisible && (
          <Action.Secondary {...secondaryAction}>
            {secondaryAction?.title}
          </Action.Secondary>
        )}
        {moreActions && moreActions.length > 0 && (
          <Action.More metadata={{ testId: 'more-actions' }}>
            {moreActions
              ?.filter(({ isVisible = true }) => isVisible)
              .map(({ title, onClick, disabled }) => (
                <DropdownMenu.Item
                  key={title}
                  name={title}
                  onSelect={onClick}
                  disabled={disabled}
                />
              ))}
          </Action.More>
        )}
      </PageHierarchical.NavigationBar>
      <PageHierarchical.LayoutFullWidth title={title}>
        {legalEntities && (
          <Slot name="Title.Accessory">
            <LegalEntityPicker {...legalEntities} />
          </Slot>
        )}
        {tabs && <TabBar {...tabs} layoutRef={tabsRef} />}
        {rest}
      </PageHierarchical.LayoutFullWidth>
      <PageHierarchical.Panel>{slots.panel}</PageHierarchical.Panel>
    </PageHierarchical.Root>
  );
};
