import { type PropsWithChildren, useState, useRef, type FC } from 'react';
import { PageHierarchical } from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { Drawer, Action } from 'designSystem/component/panel';
import { icons } from 'designSystem/component/icon';
import {
  ActionBar,
  Actions as ActionBarActions,
} from 'designSystem/component/action-bar';
import { type InfoPicker } from './Pickers/types';
import { TitleAccessoryPicker } from './Pickers/TitleAccessoryPicker';

type LayoutProps = {
  title: string;
  legalEntitiesPicker?: InfoPicker;
  tabs?: InfoPicker;
};
export const PayrollLayout = ({
  children,
  title,
  legalEntitiesPicker,
  tabs,
}: PropsWithChildren<LayoutProps>) => {
  const [panelOpen, setPanelOpen] = useState(true);
  const drawerRef = useRef(null);
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <PageHierarchical.Root
      pageRef={pageRef}
      panelOpen={panelOpen}
      onPanelOpenChange={setPanelOpen}
    >
      <PageHierarchical.NavigationBar>
        <BreadcrumbNav
          breadcrumbSchema={[
            { id: 'breadcrumb 1', label: 'breadcrumb 1' },
            { id: 'breadcrumb 2', label: 'breadcrumb 2', isVisible: true },
          ]}
        />
        <Action.Secondary onClick={() => alert('secondary action')}>
          Secondary
        </Action.Secondary>
        <Action.Primary onClick={() => alert('primary action')}>
          Primary
        </Action.Primary>
        <Action.More>
          <DropdownMenu.Item
            name="Action 1"
            onSelect={() => alert('Action 1')}
          />
          <DropdownMenu.Item
            name="Action 2"
            onSelect={() => alert('Action 2')}
          />
          <DropdownMenu.Item
            name="Action 3"
            onSelect={() => alert('Action 3')}
          />
        </Action.More>
      </PageHierarchical.NavigationBar>
      <PageHierarchical.LayoutFullWidth title={title}>
        {legalEntitiesPicker && (
          <TitleAccessoryPicker {...legalEntitiesPicker} />
        )}
        {children}
      </PageHierarchical.LayoutFullWidth>
      <PageHierarchical.Panel>
        <Drawer drawerRef={drawerRef}>
          <Drawer.NavigationBar title="Drawer title">
            <Action.Stepper
              next={{
                onClick: () => alert('next'),
                'aria-label': 'Next employee',
              }}
              previous={{
                onClick: () => alert('previous'),
                'aria-label': 'Previous employee',
              }}
            />
            <Action.IconButton
              aria-label="label"
              icon={icons.star}
              variant="ghost"
            />
            <Action.More>
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
            </Action.More>
          </Drawer.NavigationBar>
          <Drawer.Content title="Edit vacation absence type">
            <p>Hello there</p>
          </Drawer.Content>
          <ActionBar>
            <ActionBarActions.Primary>Save</ActionBarActions.Primary>
            <ActionBarActions.Secondary variant="ghost">
              Cancel
            </ActionBarActions.Secondary>
          </ActionBar>
        </Drawer>
      </PageHierarchical.Panel>
    </PageHierarchical.Root>
  );
};
