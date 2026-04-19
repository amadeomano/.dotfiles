/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/design-system-component-panel-types' {
  export type PanelProps = import('./types').PanelComponentProps;
  export type DrawerProps = import('./types').DrawerProps;
  export type PanelNavigationBarProps =
    import('./types').PanelNavigationBarProps;

  export type MoreActionsProps = import('./types').MoreActionsProps;

  export type PanelComponent = import('./types').PanelComponent;
  export type DrawerComponent = import('./types').DrawerComponent;
  export type DrawerContentComponent = import('./types').DrawerContentComponent;
  export type PanelNavigationBarComponent =
    import('./types').PanelNavigationBarComponent;

  export type DrawerContextValue = import('./types').DrawerContextValue;
  export type UseDrawerContext = import('./types').UseDrawerContext;

  export type DetailPanelContextValue =
    import('./types').DetailPanelContextValue;
  export type UseDetailPanelContext = import('./types').UseDetailPanelContext;

  const useDrawerContext: UseDrawerContext;

  const useDetailPanelContext: UseDetailPanelContext;

  export type DetailPanelProps = import('./types').DetailPanelProps;
  export type DetailPanelComponent = import('./types').DetailPanelComponent;
  export type DetailPanelContentComponent =
    import('./types').DetailPanelContentComponent;

  const Panel: PanelComponent;
  const Drawer: DrawerComponent;
  const DetailPanel: DetailPanelComponent;
  const PanelAction: import('./types').ActionItems;
  const Title: import('./types').Title;

  export {
    Panel,
    Drawer,
    DetailPanel,
    PanelAction as Action,
    Title,
    useDrawerContext,
    useDetailPanelContext,
  };
}

declare module 'designSystem/component/panel' {
  export * from '@personio-web/design-system-component-panel-types';
}

declare module '@personio-web/design-system-component-panel' {
  export * from '@personio-web/design-system-component-panel-types';
}

declare module 'designSystem/registerMocks';
