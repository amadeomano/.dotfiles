import { type PropsWithChildren } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { PageModal } from 'designSystem/component/page';
import { SidePanel, type SidePanelProps } from './PayrollSidePanel';

type LayoutProps = {
  title: string;
  onClose: () => void;
};
export const PayrollModalLayout = ({
  children,
  title,
  onClose,
}: PropsWithChildren<LayoutProps>) => {
  const { slots, rest } = createSlots(children, {
    panel: PayrollSidePanel,
  });
  const panelProps = slots.panel?.props as PayrollSidePanelProps | undefined;

  return (
    <div>
      <PageModal.Root
        panelOpen={panelProps?.isOpen}
        onPanelOpenChange={panelProps?.onClose}
      >
        <PageModal.NavigationBar onClose={onClose} />
        <PageModal.LayoutFullWidth title={title}>
          {rest}
        </PageModal.LayoutFullWidth>
        <PageModal.Panel>{slots.panel}</PageModal.Panel>
      </PageModal.Root>
    </div>
  );
};
