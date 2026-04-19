import { useMemo } from 'react';

import { useAuthContext } from '@personio-web/auth-context';
import {
  type GetEmployeeHierarchyQuery,
  useGetEmployeeHierarchyQuery,
} from '@personio-web/employees-organizations-data-gofer';
import { useHierarchicalData } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { type ColumnFilter } from 'designSystem/component/table';

import { NodeType, type EntityNode, type PositionIds } from '../types';
import { useListFilteredOpenPositions } from './useListFilteredOpenPositions';

export type UseGetCompleteHierarchyConfig = {
  skip?: boolean;
  filters?: ColumnFilter[];
  includeOpenPositions?: boolean;
};

export function useGetCompleteHierarchy(
  config?: UseGetCompleteHierarchyConfig,
) {
  const authContext = useAuthContext();
  console.log('[] datasource rerendered');

  const {
    data: peopleData,
    loading: peopleLoading,
    error: peopleError,
    refetch: refetchPeopleHierarchy,
  } = useGetEmployeeHierarchyQuery({
    skip: config?.skip,
    variables: {
      companyId: String(authContext.companyId),
      includeInclusions: true,
    },
  });

  // Fetches open positions with a target supervisor associated with it
  const {
    openPositions,
    loading: positionsLoading,
    refetch: refetchPositions,
  } = useListFilteredOpenPositions({
    filters: config?.filters && [
      {
        id: 'target_supervisor_id',
        value: {
          value: undefined,
          condition: 'is_not_empty',
        },
      },
      ...config.filters,
    ],
    skip: !config?.includeOpenPositions,
    autoFetchNextPage: true,
  });

  /*
   * Extracts the flat relationship list and hidden root node IDs from the API response.
   * The `relationshipList` contains all the relationships needed to map the hierarchy structure.
   * The `includedRootIds` contains the IDs of root nodes that have no parent or child relationships
   * and are intentionally included in the hierarchy.
   * The `hiddenRootIds` contains the IDs of root nodes that have no parent or child relationships
   * and should be excluded from the displayed hierarchy.
   */
  const [relationshipList, includedRootIds, hiddenRootIds] = useMemo(() => {
    return mapFlatRelationshipList(peopleData, openPositions);
  }, [openPositions, peopleData]);

  const hierarchy = useHierarchicalData<EntityNode>({
    data: relationshipList,
  });

  const refetch = () => {
    refetchPeopleHierarchy();
    refetchPositions();
  };

  return {
    hierarchy,
    includedRootIds,
    hiddenRootIds,
    openPositions,
    loading: peopleLoading || positionsLoading,
    error: peopleError,
    refetch,
  };
}

/*
 * Combines the root and subordinates arrays from the API response to a flat
 * list of hierarchical relationships and list of included and hidden root node ids
 */
function mapFlatRelationshipList(
  peopleData?: GetEmployeeHierarchyQuery,
  openPositions?: PositionIds,
): [EntityNode[], string[], string[]] {
  const rootItems: EntityNode[] = [];
  const leafItems: EntityNode[] = [];

  const hiddenRootIds: Set<string> = new Set();
  const includedRootIds = new Set<string>(
    peopleData?.inclusions?.items
      .map((item) => item.personId)
      .filter((id): id is string => !!id) ?? [],
  );

  if (!peopleData?.hierarchy) {
    return [[], [], []];
  }

  const { rootPersonIdsList, relationshipsList } = peopleData.hierarchy;

  // Map people root nodes
  if (!rootPersonIdsList?.length) {
    return [[], [], []];
  }

  rootPersonIdsList.forEach((id) => {
    if (!id) {
      return;
    }

    if (!includedRootIds.has(id)) {
      hiddenRootIds.add(id);
    }

    rootItems.push({
      id,
      entity_id: id,
      parent_id: null,
      type: NodeType.Person,
    });
  });

  if (!relationshipsList?.length) {
    const filteredRootItems = rootItems.filter(
      (item) => !hiddenRootIds.has(item.id),
    );

    return [
      [...filteredRootItems, ...leafItems],
      [...includedRootIds],
      [...hiddenRootIds],
    ];
  }

  // Map leaf people nodes
  relationshipsList.forEach((relationship) => {
    if (
      !(
        relationship &&
        relationship.supervisorPersonId &&
        relationship.subordinatePersonIdsList?.length
      )
    ) {
      return;
    }
    const { supervisorPersonId, subordinatePersonIdsList } = relationship;

    subordinatePersonIdsList.forEach((subordinatePersonId) => {
      if (!subordinatePersonId) {
        return;
      }

      if (hiddenRootIds.has(supervisorPersonId)) {
        hiddenRootIds.delete(supervisorPersonId);
      }

      leafItems.push({
        id: subordinatePersonId,
        entity_id: subordinatePersonId,
        parent_id: supervisorPersonId,
        type: NodeType.Person,
      });
    });
  });

  // Map leaf position nodes
  openPositions?.forEach((position) => {
    if (!position.targetSupervisorId) {
      return;
    }

    const { id, targetSupervisorId } = position;

    if (hiddenRootIds.has(targetSupervisorId)) {
      hiddenRootIds.delete(targetSupervisorId);
      includedRootIds.add(targetSupervisorId);
      rootItems.push({
        id: targetSupervisorId,
        entity_id: targetSupervisorId,
        parent_id: null,
        type: NodeType.Person,
      });
    }

    leafItems.push({
      id,
      entity_id: id,
      parent_id: targetSupervisorId,
      type: NodeType.Position,
    });
  });

  const filteredRootItems = rootItems.filter(
    (item) => !hiddenRootIds.has(item.id),
  );

  return [
    [...filteredRootItems, ...leafItems],
    [...includedRootIds],
    [...hiddenRootIds],
  ];
}
