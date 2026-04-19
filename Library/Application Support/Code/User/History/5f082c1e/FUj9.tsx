import { type PropsWithChildren, type ReactElement } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { PageModal } from 'designSystem/component/page';
import { icons } from 'designSystem/component/icon';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { Action as PanelAction, Drawer } from 'designSystem/component/panel';

type PanelProps = {
  isOpen: boolean;
  onClose: () => void;
};
export const SidePanel = ({ children }: PropsWithChildren<PanelProps>) => (
  <Drawer>
    <Drawer.NavigationBar title="Hello">
      <PanelAction.Stepper
        next={{
          onClick: () => alert('next'),
          'aria-label': 'Next employee',
        }}
        previous={{
          onClick: () => alert('previous'),
          'aria-label': 'Previous employee',
        }}
      />
      <PanelAction.IconButton
        aria-label="label"
        icon={icons.star}
        variant="ghost"
      />
      <PanelAction.More>
        <DropdownMenu.Item icon={icons.trash} name="Save" variant="positive" />
        <DropdownMenu.Item
          name="Delete"
          variant="destructive"
          icon={icons.trash}
          onSelect={() => alert('Action 2')}
        />
      </PanelAction.More>
    </Drawer.NavigationBar>
    <Drawer.Content title="Employee information">{children}</Drawer.Content>
  </Drawer>
);

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

  const panel = slots.panel as ReactElement<PanelProps> | undefined;
  console.log('[]', panel);

  return (
    <div>
      <PageModal.Root
        panelOpen={panel?.props.isOpen}
        onPanelOpenChange={panel?.props.onClose}
      >
        <PageModal.NavigationBar onClose={onClose} />
        <PageModal.LayoutFullWidth title={title}>
          {rest}
        </PageModal.LayoutFullWidth>
      </PageModal.Root>
      <PageModal.Panel>
        <SidePanel isOpen onClose={console.log('something')}>
          Hello
        </SidePanel>
      </PageModal.Panel>
    </div>
  );
};
