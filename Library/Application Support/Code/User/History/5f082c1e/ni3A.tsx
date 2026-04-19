import { type PropsWithChildren, useState } from 'react';
import { createSlots } from '@personio-web/design-system-utils';
import { PageModal } from 'designSystem/component/page';
import { icons } from 'designSystem/component/icon';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { Action as PanelAction, Drawer } from 'designSystem/component/panel';

export const SidePanel = () => (
  <Drawer>
    <Drawer.NavigationBar title="title">
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
    <Drawer.Content title="Employee information">Content Here</Drawer.Content>
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
  const [panelOpen, setPanelOpen] = useState(true);
  const { slots, rest } = createSlots(children, {
    panel: SidePanel,
  });

  return (
    <div>
      <PageModal.Root panelOpen={panelOpen} onPanelOpenChange={setPanelOpen}>
        <PageModal.NavigationBar onClose={onClose} />
        <PageModal.LayoutFullWidth title={title}>
          {rest}
        </PageModal.LayoutFullWidth>
        <PageModal.Panel>{/* <SidePanel /> */}</PageModal.Panel>
      </PageModal.Root>
    </div>
  );
};
