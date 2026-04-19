import { type PropsWithChildren, useState } from 'react';
import { useRouter } from 'next/router';
import { PageModal } from 'designSystem/component/page';
import { icons } from 'designSystem/component/icon';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { Action as PanelAction, Drawer } from 'designSystem/component/panel';

type LayoutProps = {
  title: string;
  onClose: () => void;
};
export const PayrollModalLayout = ({
  children,
  title,
  onClose,
}: PropsWithChildren<LayoutProps>) => {
  const { query, replace } = useRouter();
  const closePanel = () => {
    const { uid, ...newQuery } = query;
    replace({ query: newQuery });
  };

  return (
    <div>
      <PageModal.Root
        panelOpen={query.uid !== undefined}
        onPanelOpenChange={closePanel}
      >
        <PageModal.NavigationBar onClose={onClose} />
        <PageModal.LayoutFullWidth title={title}>
          {children}
        </PageModal.LayoutFullWidth>
        <PageModal.Panel>
          <Drawer>
            <Drawer.NavigationBar title={title}>
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
                <DropdownMenu.Item
                  icon={icons.trash}
                  name="Save"
                  variant="positive"
                />
                <DropdownMenu.Item
                  name="Delete"
                  variant="destructive"
                  icon={icons.trash}
                  onSelect={() => alert('Action 2')}
                />
              </PanelAction.More>
            </Drawer.NavigationBar>
            <Drawer.Content title="Employee information">
              Content Here
            </Drawer.Content>
          </Drawer>
        </PageModal.Panel>
      </PageModal.Root>
    </div>
  );
};
