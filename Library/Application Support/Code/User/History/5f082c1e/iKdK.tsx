import { type PropsWithChildren } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { PageModal } from 'designSystem/component/page';
import {
  PayrollSidePanel,
  type PayrollSidePanelProps,
} from './PayrollSidePanel';

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

  return (
    <div>
      <PageModal.Root
        panelOpen={(slots.panel?.props as PayrollSidePanelProps).isOpen}
        onPanelOpenChange={
          (slots.panel?.props as PayrollSidePanelProps).onClose
        }
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
