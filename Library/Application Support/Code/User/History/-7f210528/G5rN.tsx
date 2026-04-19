import { PageModal, Action } from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { createSlots } from '@personio-web/design-system-utils';

import type { PayrollModalLayoutComponent } from './types';
import { PayrollSidePanel, type SidePanelProps } from './PayrollSidePanel';

export const PayrollModalLayout: PayrollModalLayoutComponent = ({
  children,
  title,
  onClose,
  primaryAction,
  moreActions,
}) => {
  const { slots, rest } = createSlots(children, {
    panel: PayrollSidePanel,
  });
  const panelProps = slots.panel?.props as SidePanelProps | undefined;

  return (
    <div>
      <PageModal.Root
        panelOpen={panelProps?.isOpen}
        onPanelOpenChange={panelProps?.onClose}
      >
        <PageModal.NavigationBar onClose={onClose}>
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
        </PageModal.NavigationBar>
        <PageModal.LayoutFullWidth title={title}>
          {rest}
        </PageModal.LayoutFullWidth>
        <PageModal.Panel>{slots.panel}</PageModal.Panel>
      </PageModal.Root>
    </div>
  );
};
