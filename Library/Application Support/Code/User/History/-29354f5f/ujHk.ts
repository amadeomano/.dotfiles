import { useMemo } from 'react';
import { type EntityNode } from '@personio-web/employees-organizations-feature-org-chart';
import { useHierarchicalData } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { useListOrgUnitsHierarchy } from '@personio-web/employees-organizations-gofer';
import { type ListOrgUnitsHierarchyQueryResult } from '@personio-web/employees-organizations-gofer';

import { NodeMap } from '../../../Nodes/constants';
import { type Source } from '../../preferences/types';
import { type CompleteHierarchyResult } from '../../data/types';
import { useOrgChartPreferencesContext } from '../../../contexts';

const orgUnitFilter: Record<Source, string> = {
  Supervisor: '',
  Department: 'type == department',
  Team: 'type == team',
};

export const useCompleteHierarchy: CompleteHierarchyResult = (vars) => {
  const prefs = useOrgChartPreferencesContext();

  const filter = orgUnitFilter[prefs.source] ?? '';
  const orgUnitsHierarchyData = useListOrgUnitsHierarchy({
    queryOptions: { enabled: vars?.enabled },
    variables: { filter },
  });

  const [relationships, rootIds] = useMemo(
    () => getFlattenedHierarchy(orgUnitsHierarchyData.data?.data),
    [orgUnitsHierarchyData.data?.data],
  );

  const hierarchy = useHierarchicalData<OrgUnitEntityNode>({
    data: relationships,
  });

  // For a node to be included it must have:
  // 1. at least one direct member
  // 2. or it is an ancestor of a node that has at least one direct member
  const finalNodes = useMemo(() => {
    const whiteListedNodes = new Set<OrgUnitEntityNode>();
    hierarchy.nodes.forEach((node) => {
      if (!node.data.directMemberCount) return;
      whiteListedNodes.add(node.data);
      node.ancestors.forEach((ancestor) => whiteListedNodes.add(ancestor.data));
    });
    return [...whiteListedNodes.values()];
  }, [hierarchy]);

  const finalHierarchy = useHierarchicalData<EntityNode>({
    data: finalNodes,
  });

  return {
    data: {
      source: (prefs.source === 'Department' ? 'Department' : 'Team') as
        | 'Department'
        | 'Team',
      hierarchy: finalHierarchy,
      includedRootIds: rootIds,
      hiddenRootIds: [],
      // TODO: Add leadsCount once the GraphQL query includes this field
      // leadsCount: orgUnitsHierarchyData.data?.data?.orgUnits?.leadsCount,
    },
    isLoading: orgUnitsHierarchyData.isLoading,
    error: orgUnitsHierarchyData.error,
    refetch: orgUnitsHierarchyData.refetch,
  };
};

export type OrgUnitEntityNode = EntityNode & { directMemberCount: number };
const getFlattenedHierarchy = (
  orgUnitHierarchy?: ListOrgUnitsHierarchyQueryResult,
): [OrgUnitEntityNode[], string[]] => {
  const rootItems: OrgUnitEntityNode[] = [];
  const leafItems: OrgUnitEntityNode[] = [];

  if (!orgUnitHierarchy?.orgUnits?.orgUnitsList) {
    return [[], []];
  }

  const orgUnits = orgUnitHierarchy?.orgUnits?.orgUnitsList;

  orgUnits?.forEach((orgUnit) => {
    if (!orgUnit.id.id) return;

    const node: OrgUnitEntityNode = {
      id: orgUnit.id.id,
      directMemberCount: orgUnit.directMemberCount ?? 0,
      parent_id: orgUnit.parentId?.id ?? null,
      entity_id: orgUnit.id.id,
      type: NodeMap.OrgUnit,
    };

    if (orgUnit.parentId === null) rootItems.push(node);
    else leafItems.push(node);
  });

  const rootIds = rootItems.map((item) => item.id);

  return [[...rootItems, ...leafItems], [...rootIds]];
};
