import { type PropsWithChildren } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { SidePanel, type SidePanelProps } from './PayrollSidePanel';
import { Action, PageModal } from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';

type ActionProps = {
  title: string;
  isLoading?: boolean;
  isVisible?: boolean;
  status?: string;
  onClick: <T>(param?: T) => void;
};

type LayoutProps = {
  title: string;
  primaryAction?: ActionProps;
  moreActions?: ActionProps[];
  onClose: () => void;
};

export const PayrollModalLayout = ({
  children,
  title,
  primaryAction,
  moreActions,
  onClose,
}: PropsWithChildren<LayoutProps>) => {
  const { slots, rest } = createSlots(children, {
    panel: SidePanel,
  });
  const panelProps = slots.panel?.props as SidePanelProps | undefined;

  return (
    <div>
      <PageModal.Root
        panelOpen={panelProps?.isOpen}
        onPanelOpenChange={panelProps?.onClose}
      >
        <PageModal.NavigationBar onClose={onClose}>
          {!primaryAction?.isVisible && (
            <Action.Primary
              loading={primaryAction?.isLoading}
              onClick={primaryAction?.onClick}
              type="button"
            >
              {primaryAction?.title}
            </Action.Primary>
          )}
          <Action.More metadata={{ testId: 'more-actions' }}>
            {moreActions?.map(({ title, onClick }) => (
              <DropdownMenu.Item key={title} name={title} onSelect={onClick} />
            ))}
          </Action.More>
        </PageModal.NavigationBar>
        <PageModal.LayoutFullWidth title={title}>
          {rest}
        </PageModal.LayoutFullWidth>
        <PageModal.Panel>{slots.panel}</PageModal.Panel>
      </PageModal.Root>
    </div>
  );
};
