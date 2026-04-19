/**
 * this hook is responsible for managing the state of the displayed nodes on the org chart.
 * The following states are managed here:

 * - Expanded nodes: the nodes that are expanded and their children are included in the chart
 * - Active nodes: used to highlight the path that connects these nodes together
 * - Visible nodes: the caluclated nodes array that will be handed over to ReactFlow for rendering the chart
 * 
 * Following data are returned as well to enable composition with other hooks (e.g. useViewportActions)
 * 
 * - nodeHeight: the memorized nodeHeight value based on extra or highlighted attribute customisations
 * - setOnNodeClickHandler: assigns a click event listener to the displayed nodes
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

import { type HierarchyTreeNode, type HierarchyNode, NodeType } from '../types';

import { HIDDEN_ROOT_NODE_ID } from '../constants';
import {
  MIN_CARD_HEIGHT,
  NODE_ATTRIBUTE_HEIGHT,
  NODE_HIGHLIGHT_HEIGHT,
} from '../Card/constants';

import { useExpansionState } from './useExpansionState';
import { useOrgChartPreferencesContext } from './useOrgChartPreferences';
import { useOrgChartDataSourceContext } from './useOrgChartDataSourceContext';
import { useTreeLayout } from '../TreeLayout';
import { RelationshipType } from '../TreeLayout/types';

type OnNodeClickHandler = (node: HierarchyNode) => void;

type OrgChartNodesContext = {
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

const useOrgChartNodes = (): OrgChartNodesContext => {
  const preferences = useOrgChartPreferencesContext();
  const {
    isFetching,
    displayableHierarchy,
    completeHierarchyData,
    isFiltering,
  } = useOrgChartDataSourceContext();

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
    if (!isFetching) {
      if (isFiltering)
        setExpanded(displayableHierarchy.nodes.map((node) => node.id));
      else setExpanded(displayableHierarchy.rootNodes.map((node) => node.id));
    }
  }, [isFetching, isFiltering]);

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
  const setOnNodeClickHandler = (handler: OnNodeClickHandler) =>
    (onNodeClickHandler.current = handler);

  const visibleNodes: HierarchyTreeNode[] = useMemo(() => {
    // viewportInitialized avoids wrong duplicated render
    if (!displayableHierarchy.nodes.length || !viewportInitialized) {
      return [];
    }

    /*
     * The following conditions should make a node visible:
     * - Root nodes
     * - Nodes with a parent that is a hidden root node, corresponding to a spotlighted root node with additional supervisors.
     * - Nodes with a parent that is expanded
     */
    const visibleNodes = displayableHierarchy.nodes.filter(
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
        isIncluded: completeHierarchyData.includedRootIds?.includes(node.id),
        isActive: activeNodeIds.includes(node.id),
        onClick: () => onNodeClickHandler.current?.(node),
        hidePersonalInfo: !preferences.cardPreferences.personalInfo,
        hideAvatars: !preferences.cardPreferences.avatars,
        // mode
        // additionalSupervisorAttributes
      };

      return visibleNode;
    });
  }, [
    displayableHierarchy.nodes,
    completeHierarchyData.includedRootIds,
    preferences.attributes,
    preferences.highlighted,
    nodeHeight,
    preferences.filters,
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
}: PropsWithChildren) => {
  const contextValue = useOrgChartNodes();

  return (
    <OrgChartNodesContext.Provider value={contextValue}>
      {children}
    </OrgChartNodesContext.Provider>
  );
};
