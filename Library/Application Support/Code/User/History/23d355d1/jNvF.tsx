/**
 * This context provider is responsible to serve the data source to Org Chart.
 *
 * The following data will be fetched to compute the state:
 * - completeHierarchy: the full raw hierarchy data to be processed further
 * - spotlightedPerson: person information for the spotlighted person
 * - additionalSupervisorAttibutes: indicating which extra relationships (for spotlighting) are available
 * - filteredIds: fetches the list of person IDs according to the filter criterias
 * - searchResults: fetches the matching employee information according to the search term and filtering state
 *
 * TODO [OS-1041]: separate the concerns of spotlight & filter from here
 * The folloiwng source states are managed by this provider and serveed to its consumers:
 * - isFetching: indicates if any of above data is being fetched
 * - hasFetchErrors: if any of the above fetching operations ecnountered an error
 * - displayableHierarchy: the source-of-truth displayed hierarchy (either complete or filtered, depending on criteria)
 * - completeHierarchyData: the main hierarchy data. before any filtering applied.
 * - filteredHierarchy: the nodal representatin of the hierarchy when filtering is applied (equal to displayableHierarchy when isFiltering == true)
 * - isFiltering: true if filtering or spotlighting
 * - groups: the {id:label} representation of extra relationships for the spotlighted person
 * - spotlightedPerson: employee information about the spotlighted person
 * - personSearch: information of employees that match the searching term criteria
 */

import {
  type PropsWithChildren,
  type SetStateAction,
  type Dispatch,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { type ApolloError } from '@apollo/client';

import {
  type UseHierarchicalDataReturnType,
  useHierarchicalData,
} from '@personio-web/employees-organizations-hook-use-hierarchical-data';

import {
  type EntityNode,
  type OrgChartPreferences,
  HierarchicalRelationshipType,
  NodeType,
} from '../types';
import { HIDDEN_ROOT_NODE_ID } from '../constants';

import {
  useGetAdditionalSupervisorAttributes,
  useGetCompleteHierarchy,
  useGetPersonCardData,
  useGetSearchResults,
  useListFilteredIds,
  useExpansionState,
} from '../hooks';

import { RelationshipType } from '../TreeLayout/types';

type ProviderProps = {
  preferences: OrgChartPreferences;
};

type ActiveNodesState = {
  activeNodeIds: string[];
  setActiveNodeIds: Dispatch<SetStateAction<string[]>>;
};

type OrgChartDataSourceContext = {
  isFetching: boolean;
  hasFetchErrors: ApolloError | unknown | undefined;
  displayableHierarchy: UseHierarchicalDataReturnType<EntityNode>;
  completeHierarchyData: ReturnType<typeof useGetCompleteHierarchy>;
  filteredHierarchy: ReturnType<typeof useHierarchicalData<EntityNode>>;
  isFiltering: boolean;
  groups: Record<string, string> | undefined;
  spotlightedPerson: ReturnType<typeof useGetPersonCardData>;
  personSearch: ReturnType<typeof useGetSearchResults>;
  expansionState: ReturnType<typeof useExpansionState>;
  activeNodesState: ActiveNodesState;
};

const OrgChartDataSourceContext =
  createContext<OrgChartDataSourceContext | null>(null);

const useOrgChartDataSource = ({
  preferences,
}: ProviderProps): OrgChartDataSourceContext => {
  const additionalAttribs = useGetAdditionalSupervisorAttributes();

  const additionalSupervisorAttributeIds = useMemo(
    () =>
      additionalAttribs.additionalSupervisorAttributes &&
      Object.keys(additionalAttribs.additionalSupervisorAttributes),
    [additionalAttribs],
  );

  const completeHierarchyData = useGetCompleteHierarchy({
    filters: preferences.filters,
    includeOpenPositions: preferences.cardPreferences.openPositions,
  });

  const spotlightedPerson = useGetPersonCardData(preferences.spotlight, {
    additionalSupervisorAttributeIds,
    enabled: !additionalAttribs.isLoading,
  });

  const groups = useMemo(() => {
    if (
      !preferences.spotlight ||
      !spotlightedPerson.additionalRelationships ||
      !additionalAttribs.additionalSupervisorAttributes
    ) {
      return undefined;
    }

    const groups: Record<string, string> = {};

    spotlightedPerson.additionalRelationships.forEach(({ attributeId }) => {
      // the truthiness is already checked on the condition above
      groups[attributeId] =
        additionalAttribs.additionalSupervisorAttributes![attributeId];
    });

    return groups;
  }, [
    additionalAttribs.additionalSupervisorAttributes,
    preferences.spotlight,
    spotlightedPerson.additionalRelationships,
  ]);

  const filteredIdsData = useListFilteredIds(preferences.filters);

  const filteredNodes = useMemo<EntityNode[]>(() => {
    let completeMatchedIds = filteredIdsData.matchedIds ?? [];
    const matchedNodes = new Set<string>();
    const unmatchedAncestorNodes = new Set<string>();

    const spotlightNode =
      !!preferences.spotlight &&
      completeHierarchyData.hierarchy.getNode(preferences.spotlight);

    // If a node is spotlighted, all filter criteria is ignored
    if (spotlightNode) {
      completeMatchedIds = [spotlightNode.id];
    }

    // Include open positions in the matched nodes if no spotlight is set
    if (
      !spotlightNode &&
      preferences.cardPreferences.openPositions &&
      completeHierarchyData.openPositions?.length
    ) {
      completeMatchedIds.push(
        ...completeHierarchyData.openPositions.map((item) => item.id),
      );
    }

    // Populate matchedNodes and unmatchedAncestorNodes
    if (completeMatchedIds.length) {
      completeMatchedIds.forEach((matchedId) => {
        const node = completeHierarchyData.hierarchy.getNode(matchedId);
        if (node) {
          matchedNodes.add(matchedId);

          if (spotlightNode) {
            if (
              !preferences.spotlightVisibleRelationships.length ||
              preferences.spotlightVisibleRelationships.includes(
                HierarchicalRelationshipType.Supervisor,
              )
            ) {
              node.ancestors.forEach((ancestor) => {
                matchedNodes.add(ancestor.id);
              });
            }

            if (
              !preferences.spotlightVisibleRelationships.length ||
              preferences.spotlightVisibleRelationships.includes(
                HierarchicalRelationshipType.Report,
              )
            ) {
              node.descendants.forEach((ancestor) => {
                matchedNodes.add(ancestor.id);
              });
            }
          } else {
            node.ancestors.forEach((ancestor) => {
              if (!matchedNodes.has(ancestor.id)) {
                unmatchedAncestorNodes.add(ancestor.id);
              }
            });
          }
        }
      });
    }

    /*
     * Include open positions in the matched nodes if a spotlight is set and
     * the open position is within the spotlight node hierarchy chain
     */
    if (
      spotlightNode &&
      preferences.cardPreferences.openPositions &&
      completeHierarchyData.openPositions?.length &&
      matchedNodes.size > 0
    ) {
      completeHierarchyData.openPositions.forEach((openPosition) => {
        if (
          openPosition.targetSupervisorId &&
          openPosition.targetSupervisorId === spotlightNode.id
        ) {
          matchedNodes.add(openPosition.id);
        }
      });
    }

    // Use reduce to filter and transform nodes in a single pass.
    // By iterating directly over completeHierarchy.nodes, we ensure that
    // the original order of nodes is maintained, preserving the hierarchy structure.
    if (matchedNodes.size) {
      let nodes = completeHierarchyData.hierarchy.nodes.reduce<EntityNode[]>(
        (acc, node) => {
          if (matchedNodes.has(node.id)) {
            // Add as a matched person card
            acc.push(node.data);
          } else if (unmatchedAncestorNodes.has(node.id)) {
            // Add as an unmatched person card
            acc.push({ ...node.data, type: NodeType.UnmatchedPerson });
          }

          return acc;
        },
        [],
      );

      /*
       * Maps additional relationships:
       */

      /*
       * If a spotlighted node is not a root node and has no visible supervisor relationship,
       * remove the parent_id to display the spotlighted node at the top of the hierarchy.
       */
      if (
        spotlightNode &&
        spotlightNode.parent !== null &&
        preferences.spotlightVisibleRelationships.length &&
        !preferences.spotlightVisibleRelationships.includes(
          HierarchicalRelationshipType.Supervisor,
        )
      ) {
        nodes = nodes.map((node) => {
          if (node.id === spotlightNode.id) {
            return { ...node, parent_id: null };
          }

          return node;
        });
      }

      /*
       * - Additional supervisors are placed one level above the spotlighted node
       *   by assigning the grandparent of the spotlighted node as their parent_id.
       * - Additional subordinates are placed one level below by setting the
       *   spotlighted node as their parent_id.
       */
      if (spotlightNode && spotlightedPerson.additionalRelationships?.length) {
        let supervisorParentId: EntityNode['parent_id'] =
          spotlightNode.parent?.parent?.id ?? null;

        /*
         * If the spotlighted node is a root node and has additional supervisors,
         * or if the spotlighted node has no visible supervisor relationship,
         * create a new root node to display those additional supervisors above the highlighted node.
         */
        if (
          (spotlightNode.parent === null ||
            (preferences.spotlightVisibleRelationships.length &&
              !preferences.spotlightVisibleRelationships.includes(
                HierarchicalRelationshipType.Supervisor,
              ))) &&
          spotlightedPerson.additionalRelationships.find(
            ({ type }) => type === 'supervisor',
          )
        ) {
          nodes = nodes.map((node) => {
            if (node.parent_id === null) {
              return {
                ...node,
                parent_id: HIDDEN_ROOT_NODE_ID,
              };
            }
            return node;
          });

          const hiddenRootNode: EntityNode = {
            id: HIDDEN_ROOT_NODE_ID,
            entity_id: HIDDEN_ROOT_NODE_ID,
            parent_id: null,
            type: NodeType.Person,
            hidden: true,
          };
          supervisorParentId = null;
          nodes.push(hiddenRootNode);
        }

        const relationshipNodes = spotlightedPerson.additionalRelationships
          .filter(({ attributeId, type }) => {
            if (!preferences.spotlightVisibleRelationships.length) {
              return true;
            }

            if (type === 'supervisor') {
              return preferences.spotlightVisibleRelationships.includes(
                `${HierarchicalRelationshipType.Supervisor}:${attributeId}`,
              );
            }

            if (type === 'subordinate') {
              return preferences.spotlightVisibleRelationships.includes(
                `${HierarchicalRelationshipType.Report}:${attributeId}`,
              );
            }

            return false;
          })
          .map(({ attributeId, personId, type }) => ({
            id: `${attributeId}-${personId}-${type}`,
            group: {
              id: attributeId,
              relatedNodeId: spotlightNode.id,
              relationshipType:
                type === 'subordinate'
                  ? RelationshipType.Child
                  : RelationshipType.Parent,
            },
            entity_id: personId,
            parent_id:
              type === 'subordinate'
                ? spotlightNode.id
                : supervisorParentId ?? null,
            type: NodeType.Person,
          }));

        if (relationshipNodes?.length) {
          nodes.push(...relationshipNodes);
        }
      }

      return nodes;
    }

    return [];
  }, [
    preferences.cardPreferences.openPositions,
    completeHierarchyData.loading,
    filteredIdsData.matchedIds,
    preferences.spotlight,
    spotlightedPerson.loading,
    preferences.spotlightVisibleRelationships.length,
  ]);

  const filteredHierarchy = useHierarchicalData<EntityNode>({
    data: filteredNodes,
  });

  const isFiltering = Boolean(
    preferences.filters.length ||
      (preferences.spotlight && filteredNodes.length),
  );

  const displayableHierarchy = isFiltering
    ? filteredHierarchy
    : completeHierarchyData.hierarchy;

  const expansionState = useExpansionState([]);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  const activeNodesState = { activeNodeIds, setActiveNodeIds };

  // Inititalise expansion state once all nodes are fetched
  // useEffect(() => {
  //   if (!completeHierarchyData.loading) {
  //     if (isFiltering && !filteredIdsData.loading) {
  //       expansionState.setExpanded(
  //         displayableHierarchy.nodes.map((node) => node.id),
  //       );
  //     } else {
  //       expansionState.setExpanded(
  //         displayableHierarchy.rootNodes.map((node) => node.id),
  //       );
  //     }
  //   }
  // }, [completeHierarchyData.loading, filteredIdsData.loading]);

  const personSearch = useGetSearchResults({
    searchTerm: preferences.searchTerm,
    isFiltering,
    getCompleteHierarchyNode: completeHierarchyData.hierarchy.getNode,
    getFilteredHierarchyNode: filteredHierarchy.getNode,
  });

  const isFetching =
    additionalAttribs.isLoading ||
    completeHierarchyData.loading ||
    filteredIdsData.loading ||
    (!!preferences.spotlight && spotlightedPerson.loading);

  const hasFetchErrors =
    completeHierarchyData.error ||
    filteredIdsData.error ||
    spotlightedPerson.error;

  return {
    isFetching,
    hasFetchErrors,
    displayableHierarchy,
    completeHierarchyData,
    filteredHierarchy,
    isFiltering,
    groups,
    spotlightedPerson,
    personSearch,
    expansionState,
    activeNodesState,
  };
};

export const useOrgChartDataSourceContext = () => {
  const context = useContext(OrgChartDataSourceContext);

  if (context === null) {
    throw new Error(
      'useOrgChartDataSourceContext must be used within an OrgChartDataSourceContextProvider',
    );
  }

  return context;
};

export const OrgChartDataSourceContextProvider = ({
  children,
  preferences,
}: PropsWithChildren<ProviderProps>) => {
  const contextValue = useOrgChartDataSource({ preferences });

  return (
    <OrgChartDataSourceContext.Provider value={contextValue}>
      {children}
    </OrgChartDataSourceContext.Provider>
  );
};
