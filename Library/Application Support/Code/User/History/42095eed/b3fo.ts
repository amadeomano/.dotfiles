import type { UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';

import { type TreeLayoutModes } from '../TreeLayout/types';
import {
  type CardPreferences,
  type EntityNode,
  type HierarchyNode,
} from '../types';

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
    expanded: string[];
    setExpanded: (nextExpanded: string[]) => void;
    handleToggleExpand: (node: HierarchyNode) => void;
    activeNodeIds: string[];
    setActiveNodeIds: (nextActiveNodeIds: string[]) => void;
  };
