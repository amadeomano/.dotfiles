/**
 * this hook is responsible for managing the state of the displayed nodes on the org chart.
 * The following states are managed here:

 * - Expanded nodes: the nodes that are expanded and their children are included in the chart
 * - Active nodes: used to highlight the path that connects these nodes together
 * - Visible nodes: the caluclated nodes array that will be handed over to ReactFlow for rendering the chart
 */

import {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from 'react';

import { type UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import {
  type HierarchyTreeNode,
  type EntityNode,
  type HierarchyNode,
  NodeType,
} from '../types';

import { HIDDEN_ROOT_NODE_ID } from '../constants';
import {
  MIN_CARD_HEIGHT,
  NODE_ATTRIBUTE_HEIGHT,
  NODE_HIGHLIGHT_HEIGHT,
} from '../Card/constants';

import { useExpansionState } from './useExpansionState';
import { useViewportActions } from './useViewportActions';
import { useGetCompleteHierarchy } from './useGetCompleteHierarchy';
import { useOrgChartPreferencesContext } from './useOrgChartPreferences';
import { useTreeLayout } from '../TreeLayout';
import { RelationshipType, type TreeLayoutModes } from '../TreeLayout/types';

type OnNodeClickHandler = (node: HierarchyNode) => void;

type ProviderProps = {
  hierarchyData: ReturnType<typeof useGetCompleteHierarchy>;
};
type OrgChartNodesContext = {
  hierarchyData: ReturnType<typeof useGetCompleteHierarchy>;
  expandedNodes: ReturnType<typeof useExpansionState>;
  activeNodes: {
    activeNodeIds: string[];
    setActiveNodeIds: Dispatch<SetStateAction<string[]>>;
  };
  visibleNodes: HierarchyTreeNode[];
  nodeHeight: number;
  setOnNodeClickHandler: (handler: OnNodeClickHandler) => void;
};
const OrgChartNodesContext = createContext<OrgChartNodesContext | null>(null);

const useOrgChartNodes = ({
  hierarchyData,
}: ProviderProps): OrgChartNodesContext => {
  const preferences = useOrgChartPreferencesContext();

  const { viewportInitialized } = useTreeLayout<HierarchyTreeNode>();

  const { expanded, setExpanded, handleToggleExpand } = useExpansionState([]);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  // const { fitNodes } = useViewportActions({
  //   hierarchy: hierarchy.hierarchy,
  //   expandedNodes: { expanded, setExpanded, handleToggleExpand },
  //   activeNodes: { activeNodeIds, setActiveNodeIds },
  // });

  /** react to loading effect after the hierarchy is ready */
  useEffect(() => {
    if (!hierarchyData.loading)
      setExpanded(hierarchyData.hierarchy.rootNodes.map((node) => node.id));
  }, [hierarchyData.loading]);

  const nodeHeight = useMemo(() => {
    let height = MIN_CARD_HEIGHT;

    if (preferences.attributes.length) {
      height += NODE_ATTRIBUTE_HEIGHT * preferences.attributes.length;
    }

    if (!!preferences.highlighted) {
      height += NODE_HIGHLIGHT_HEIGHT;
    }

    return height;
  }, [preferences.attributes, preferences.highlighted]);

  const onNodeClickHandler = useRef<OnNodeClickHandler | undefined>(undefined);
  const setOnNodeClickHandler = useCallback((handler: OnNodeClickHandler) => {
    onNodeClickHandler.current = handler;
  }, []);

  const visibleNodes: HierarchyTreeNode[] = useMemo(() => {
    console.log('[] calculating new visibles');
    // viewportInitialized avoids wrong duplicated render
    if (!hierarchyData.hierarchy.nodes.length || !viewportInitialized) {
      return [];
    }

    /*
     * The following conditions should make a node visible:
     * - Root nodes
     * - Nodes with a parent that is a hidden root node, corresponding to a spotlighted root node with additional supervisors.
     * - Nodes with a parent that is expanded
     */
    const visibleNodes = hierarchyData.hierarchy.nodes.filter(
      (node) =>
        node.depth === 1 ||
        node.parent?.id === HIDDEN_ROOT_NODE_ID ||
        (node.parent && expanded.includes(node.parent.id)),
    );

    return visibleNodes.map((node) => {
      const { descendants, children, data } = node;

      let totalPeopleCount = node.descendants.length - 1; // Remove own item from descendants count
      let directPeopleCount = node.childrenCount;
      let totalPositionsCount = 0;
      let directPositionsCount = 0;

      // Split report count by node type if open positions are being displayed
      const includeOpenPositions = preferences.cardPreferences.openPositions;
      if (includeOpenPositions) {
        const positionDescendants = descendants.filter(
          (descendant) => descendant.data.type === NodeType.Position,
        );
        const directPositions = children
          ? children.filter((child) => child.data.type === NodeType.Position)
          : [];

        totalPositionsCount = positionDescendants.length;
        totalPeopleCount = totalPeopleCount - totalPositionsCount;
        directPositionsCount = directPositions.length;
        directPeopleCount = directPeopleCount - directPositionsCount;
      }

      // When spotlighted we need remove subordinates from the count, to show only direct reports
      if (preferences.spotlight && preferences.spotlight === node.id) {
        const subordinatesCount =
          children?.filter(
            (child) =>
              child.data?.group?.relationshipType === RelationshipType.Child,
          )?.length || 0;

        totalPeopleCount = totalPeopleCount - subordinatesCount;
        directPeopleCount = directPeopleCount - subordinatesCount;
      }

      // When filtering we need to count unmatched people and remove from counters
      const isFiltering = preferences.filters.length > 0;
      if (isFiltering) {
        const unmatchedNodeCount =
          children?.filter?.(
            (child) => child.data.type === NodeType.UnmatchedPerson,
          )?.length ?? 0;

        const unmatchedDescendantsCount =
          descendants?.filter?.(
            (child) =>
              child.id !== node?.id &&
              child.data.type === NodeType.UnmatchedPerson,
          )?.length ?? 0;

        totalPeopleCount = totalPeopleCount - unmatchedDescendantsCount;
        directPeopleCount = directPeopleCount - unmatchedNodeCount;
      }

      const visibleNode: HierarchyTreeNode = {
        ...data,
        attributeIds: preferences.attributes,
        highlightedAttributeId: preferences.highlighted,
        height: nodeHeight,
        reports: {
          people: {
            total: totalPeopleCount,
            direct: directPeopleCount,
          },
          ...(includeOpenPositions && {
            positions: {
              total: totalPositionsCount,
              direct: directPositionsCount,
            },
          }),
        },
        isFocused:
          preferences.spotlight === node.id ||
          preferences.focusedEmployeeId === node.id,
        isIncluded: hierarchyData.includedRootIds?.includes(node.id),
        isActive: activeNodeIds.includes(node.id),
        onClick: () => onNodeClickHandler.current?.(node),
        hidePersonalInfo: !preferences.cardPreferences.personalInfo,
        hideAvatars: !preferences.cardPreferences.avatars,
        // mode
        // additionalSupervisorAttributes
      };

      return visibleNode;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hierarchyData.hierarchy.nodes,
    hierarchyData.includedRootIds,
    preferences.attributes,
    preferences.highlighted,
    nodeHeight,
    preferences.spotlight,
    preferences.focusedEmployeeId,
    activeNodeIds,
    preferences.cardPreferences.personalInfo,
    preferences.cardPreferences.avatars,
    viewportInitialized,
    expanded,
    activeNodeIds,
  ]);

  return {
    hierarchyData,
    expandedNodes: { expanded, setExpanded, handleToggleExpand },
    activeNodes: { activeNodeIds, setActiveNodeIds },
    visibleNodes,
    nodeHeight,
    setOnNodeClickHandler,
  };
};

export const useOrgChartNodesContext = () => {
  const context = useContext(OrgChartNodesContext);

  if (context === null) {
    throw new Error(
      'useOrgChartNodesContext must be used within an OrgChartNodesContextProvider',
    );
  }

  return context;
};

export const OrgChartNodesContextProvider = ({
  children,
  hierarchyData,
}: PropsWithChildren<ProviderProps>) => {
  const contextValue = useOrgChartNodes({
    hierarchyData,
  });
  return (
    <OrgChartNodesContext.Provider value={contextValue}>
      {children}
    </OrgChartNodesContext.Provider>
  );
};
