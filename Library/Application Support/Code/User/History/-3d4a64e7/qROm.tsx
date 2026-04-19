import { type PropsWithChildren, useState, useRef } from 'react';
import {
  PageHierarchical,
  BreadcrumbNav,
  Action as NavAction,
} from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { Drawer, Action as PanelAction } from 'designSystem/component/panel';
import { icons } from 'designSystem/component/icon';
import {
  ActionBar,
  Actions as ActionBarActions,
} from 'designSystem/component/action-bar';
import { type InfoPicker } from './Pickers/types';

import {
  getSchemasFn,
  useBreadcrumbSchema,
} from './Pickers/useBreadcrumbSchema';
import { TitleAccessory } from './Pickers/TitleAccessory';
import { TabBar } from './Pickers/TabBar';

type LayoutProps = {
  title: string;
  legalEntities?: InfoPicker;
  tabs?: InfoPicker;
};
export const PayrollLayout = ({
  children,
  title,
  legalEntities,
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
            { id: 'breadcrumb 1', label: 'breadcrumb 1', isVisible: false },
            { id: 'breadcrumb 2', label: 'breadcrumb 2', isVisible: false },
          ]}
        />
      </PageHierarchical.NavigationBar>
      <PageHierarchical.LayoutFullWidth title={title}>
        {legalEntities && <TitleAccessory {...legalEntities} />}
        {tabs && <TabBar {...tabs} />}
        {children}
      </PageHierarchical.LayoutFullWidth>
      <PageHierarchical.Panel>
        <Drawer drawerRef={drawerRef}>
          <Drawer.NavigationBar title="Drawer title">
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
