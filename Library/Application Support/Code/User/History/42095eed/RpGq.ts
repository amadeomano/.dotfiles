export type OrgChartTreeProps = {
  interactive?: boolean;
  groups?: Record<string, string>;
  hiddenPeopleCount?: number;
  includeOpenPositions?: boolean;
};

export type FocusOptions = {
  includeDirectAncestors?: boolean;
  animate?: boolean;
};

export type FitNodesOptions = FocusOptions & {
  waitForUpdatedPosition?: boolean;
  allowZoomIn?: boolean;
};
