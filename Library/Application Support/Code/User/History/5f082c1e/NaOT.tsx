import { type PropsWithChildren } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { PageModal } from 'designSystem/component/page';
import { SidePanel, type SidePanelProps } from './EmployeePanel';

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
    panel: SidePanel,
  });

  return (
    <div>
      <PageModal.Root
        panelOpen={(slots.panel?.props as SidePanelProps).isOpen}
        onPanelOpenChange={(slots.panel?.props as SidePanelProps).onClose}
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
