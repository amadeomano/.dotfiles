import { useRef } from 'react';
import {
  PageHierarchical,
  BreadcrumbNav,
  Action,
} from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { createSlots } from '@personio-web/design-system-utils';

import type { PayrollLayoutComponent } from './types';
import { getSchemasFn, useBreadcrumbSchema } from './components/breadcrumbs';
import { LegalEntityPicker } from './components/LegalEntityPicker';
import { TabBar } from './components/TabBar';
import { PayrollSidePanel, type SidePanelProps } from './PayrollSidePanel';

export const PayrollLayout: PayrollLayoutComponent = ({
  children,
  title,
  legalEntities,
  tabs,
  primaryAction,
  secondaryAction,
  moreActions,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const { schema } = useBreadcrumbSchema(
    pageRef,
    getSchemasFn(title, legalEntities, tabs),
  );

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
          <Action.Primary
            loading={primaryAction?.loading}
            onClick={primaryAction?.onClick}
            disabled={primaryAction?.isDisabled}
            icon={primaryAction?.icon}
            type="button"
          >
            {primaryAction?.title}
          </Action.Primary>
        )}
        {secondaryAction?.isVisible && (
          <Action.Secondary
            {...secondaryAction}
            icon={secondaryAction?.icon}
            type="button"
          >
            {secondaryAction?.title}
          </Action.Secondary>
        )}
        {moreActions && moreActions.length > 0 && (
          <Action.More metadata={{ testId: 'more-actions' }}>
            {moreActions
              ?.filter(({ isVisible = true }) => isVisible)
              .map(({ title, onClick, isDisabled }) => (
                <DropdownMenu.Item
                  key={title}
                  name={title}
                  onSelect={onClick}
                  disabled={isDisabled}
                />
              ))}
          </Action.More>
        )}
      </PageHierarchical.NavigationBar>
      <PageHierarchical.LayoutFullWidth title={title}>
        {legalEntities && <LegalEntityPicker {...legalEntities} />}
        {tabs && <TabBar {...tabs} />}
        {rest}
      </PageHierarchical.LayoutFullWidth>
      <PageHierarchical.Panel>{slots.panel}</PageHierarchical.Panel>
    </PageHierarchical.Root>
  );
};
