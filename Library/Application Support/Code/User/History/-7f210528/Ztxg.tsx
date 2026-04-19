import { useRef } from 'react';
import { PageModal, BreadcrumbNav, Action } from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { createSlots } from '@personio-web/design-system-utils';

import type { PayrollLayoutComponent } from './types';
import { getSchemasFn, useBreadcrumbSchema } from './Pickers/breadcrumbs';
import { LegalEntityPicker } from './Pickers/LegalEntityPicker';
import { TabBar } from './Pickers/TabBar';
import { PayrollSidePanel, type SidePanelProps } from './PayrollSidePanel';

export const PayrollLayout: PayrollLayoutComponent = ({
  children,
  title,
  legalEntities,
  tabs,
  primaryAction,
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

  return (
    <PageModal.Root
      pageRef={pageRef}
      panelOpen={panelProps?.isOpen}
      onPanelOpenChange={panelProps?.onClose}
    >
      <PageModal.NavigationBar>
        <BreadcrumbNav breadcrumbSchema={schema} />
        {primaryAction && (primaryAction.isVisible ?? true) && (
          <Action.Primary
            loading={primaryAction?.isLoading}
            onClick={primaryAction?.onClick}
            type="button"
          >
            {primaryAction?.title}
          </Action.Primary>
        )}
        {moreActions && moreActions.length > 0 && (
          <Action.More metadata={{ testId: 'more-actions' }}>
            {moreActions
              ?.filter(({ isVisible = true }) => isVisible)
              .map(({ title, onClick }) => (
                <DropdownMenu.Item
                  key={title}
                  name={title}
                  onSelect={onClick}
                />
              ))}
          </Action.More>
        )}
      </.NavigationBar>
      <PageHierarchical.LayoutFullWidth title={title}>
        {legalEntities && <LegalEntityPicker {...legalEntities} />}
        {tabs && <TabBar {...tabs} />}
        {rest}
      </PageHierarchical.LayoutFullWidth>
      <PageHierarchical.Panel>{slots.panel}</PageHierarchical.Panel>
    </.Root>
  );
};
