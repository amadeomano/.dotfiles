import { type TreeLayoutModes } from '../TreeLayout/types';

export type OrgChartTreeProps = {
  interactive?: boolean;
  groups?: Record<string, string>;
  mode?: TreeLayoutModes;
  includedRootIds?: string[];
  hiddenPeopleCount?: number;
  includeOpenPositions?: boolean;
  additionalSupervisorAttributes?: Record<string, string>;
};

export type FocusOptions = {
  includeDirectAncestors?: boolean;
  animate?: boolean;
};

export type FitNodesOptions = FocusOptions & {
  waitForUpdatedPosition?: boolean;
  allowZoomIn?: boolean;
};
