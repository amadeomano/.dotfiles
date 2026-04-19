import { type PropsWithChildren } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { SidePanel, type SidePanelProps } from './PayrollSidePanel';
import { Action, PageModal } from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';

type ActionProps = {
  title: string;
  isLoading?: boolean;
  status?: string;
  onClick: <T>(param?: T) => void;
};

type PayrunInfo = {
  payrunId?: string;
  payrunStatus?: string;
};

type LayoutProps = {
  title: string;
  primaryAction: ActionProps;
  moreActions: ActionProps[];
  payrunInfo: PayrunInfo;
  onClose: () => void;
};

export const PayrollModalLayout = ({
  children,
  title,
  primaryAction: {
    isLoading: isLoadingPrimaryAction,
    title: primaryActionTitle,
    onClick: onPrimaryActionClick,
  },
  payrunInfo: { payrunId, payrunStatus },
  moreActions,
  onClose,
}: PropsWithChildren<LayoutProps>) => {
  const { slots, rest } = createSlots(children, {
    panel: SidePanel,
  });
  const panelProps = slots.panel?.props as SidePanelProps | undefined;
  const isPayrunApproved = payrunStatus === 'APPROVED';

  return (
    <div>
      <PageModal.Root
        panelOpen={panelProps?.isOpen}
        onPanelOpenChange={panelProps?.onClose}
      >
        <PageModal.NavigationBar onClose={onClose}>
          {isPayrunApproved && (
            <Action.Primary
              loading={isLoadingPrimaryAction}
              onClick={() => onPrimaryActionClick(payrunId)}
              type="button"
            >
              {primaryActionTitle}
            </Action.Primary>
          )}
          <Action.More metadata={{ testId: 'more-actions' }}>
            {moreActions.map(({ title, onClick }) => (
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
