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
  const { schema } = useBreadcrumbSchema(
    pageRef,
    getSchemasFn(title, legalEntities, tabs),
  );

  return (
    <PageHierarchical.Root
      pageRef={pageRef}
      panelOpen={panelOpen}
      onPanelOpenChange={setPanelOpen}
    >
      <PageHierarchical.NavigationBar>
        <BreadcrumbNav breadcrumbSchema={schema} />
      </PageHierarchical.NavigationBar>
      <PageHierarchical.LayoutFullWidth title={title}>
        {legalEntities && <TitleAccessory {...legalEntities} />}
        {tabs && <TabBar {...tabs} />}
        {children}
      </PageHierarchical.LayoutFullWidth>
    </PageHierarchical.Root>
  );
};
