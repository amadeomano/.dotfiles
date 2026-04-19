import type { UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';

import { type TreeLayoutModes } from '../TreeLayout/types';
import { type CardPreferences, type EntityNode } from '../types';

export type OrgChartTreeProps = UseHierarchicalDataReturnType<EntityNode> &
  CardPreferences & {
    interactive?: boolean;
    focusedEmployeeId?: string;
    setFocusedEmployeeId: (newEmployeeId: string | null) => void;
    spotlight?: string;
    groups?: Record<string, string>;
    mode?: TreeLayoutModes;
    includedRootIds?: string[];
    hiddenPeopleCount?: number;
    includeOpenPositions?: boolean;
    additionalSupervisorAttributes?: Record<string, string>;
    isFiltering: boolean;
    isExporting?: boolean;
  };

export type FocusOptions = {
  includeDirectAncestors?: boolean;
  animate?: boolean;
};

export type FitNodesOptions = FocusOptions & {
  waitForUpdatedPosition?: boolean;
  allowZoomIn?: boolean;
  optionalCentering?: boolean;
};
