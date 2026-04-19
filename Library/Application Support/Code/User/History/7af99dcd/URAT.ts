import { useCallback, useEffect, useMemo } from 'react';
import { type CoordinateExtent, useReactFlow } from 'reactflow';

import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';
import { type SourceData } from '../../sources/data/types';
import { useGetActiveSourceLayout } from '../../sources/layouts/useGetActiveSourceLayout';
import { useOrgChartUIContext } from '../useOrgChartUIContext';
import { type HierarchyTreeNode } from '../../types';
import { useOrgChartPreferencesContext } from '../useOrgChartPreferences';
import {
  edgeDefaultStroke,
  edgeActiveStroke,
  HIDDEN_ROOT_NODE_ID,
  edgeStrokeDashArray,
  edgeStrokeWidth,
} from '../../constants';
import {
  type TreeNode,
  type BaseData,
  type TreeEdges,
  type GroupedNode,
  type TreeLayoutOptions,
} from '../../TreeLayout/types';
import { type CardProps } from '../../types';
import { useCardHeight } from '../../sources/cards/useCardHeight';
import { useHierarchicalTreeData } from '../../TreeLayout/hooks/useHierarchicalTreeData';
import { nodeWidth, treeLayoutStaticProps } from '../../OrgChartTree/constants';
import {
  DEFAULT_NODE_GROUP_ID,
  defaultTreeLayoutOptions,
} from '../../TreeLayout/constants';
import { getColorForString } from '../../utils/getColorForString';

export type VisibleChartData = {
  rootNodes: TreeNode<BaseData & CardProps>[];
  nodes: TreeNode<BaseData & CardProps>[];
  groupNodes: GroupedNode<BaseData & CardProps>[];
  edges: TreeEdges[];
  translateExtent: CoordinateExtent;
  nodeSize: { width: number; height: number };
};

export const useCalculateVisibleChartData = (
  activeSource: SourceData,
): VisibleChartData => {
  const reactFlow = useReactFlow();
  const ui = useOrgChartUIContext();
  const prefs = useOrgChartPreferencesContext();
  const layout = useGetActiveSourceLayout();
  const nodeHeight = useCardHeight(activeSource.completeHierarchyData);
  const { isDrawerFullyOpened } = useOrgUnitDetailsState();
  const displayableNodes = activeSource.displayableHierarchy.nodes;

  // Reflowing the chart if the drawer opes or closes, only in grid mode
  useEffect(() => {
    if (layout.layout === 'tree') {
      return;
    }

    ui.reflowToken.generate();
    prefs.viewportState.requestNewState({
      mode: 'resetViewport',
      animated: true,
    });
  }, [isDrawerFullyOpened]);

  // Why: expansion is a user preference - because the user decides what to expand or collapse
  // however in the initial render, after the datasource is fetched, some expansion state could be derieved.
  // to avoid resetting preferences and interfering with user interactions, we derive the initial expanded ids here
  // a ref of it would be available to the preferences, so that it'll be reused in their calculations
  // !! this is only allowed in this hook
  const derivedExpandedIds = useMemo(() => {
    // @ts-expect-error - setting the mirror reference is only allowed in this hook
    prefs.expansionState.derivedExpandedIds.current = null;

    if (activeSource.isFetching) return prefs.expansionState.expanded;
    if (prefs.expansionState.expanded.length)
      return prefs.expansionState.expanded;

    const derived = activeSource.getInitialExpandedIds();

    // @ts-expect-error - setting the mirror reference is only allowed in this hook
    prefs.expansionState.derivedExpandedIds.current = derived;
    return derived;
  }, [
    activeSource.isFetching,
    prefs.expansionState.expanded,
    prefs.source,
    prefs.filters,
    prefs.spotlight,
  ]);

  // Why: activating a card happens by user interaction, therefore a user preference
  // if an ID is provided at the initial render, instead of setting the preference state we derive it here
  // the result of user interaction is always preferred over the derived value
  const derivedActiveAncestorIds = useMemo(() => {
    const activeId = prefs.activeCardId ?? prefs.spotlight;

    if (!activeId) return [];
    if (activeSource.isFetching) return [];
    if (prefs.activeAncestorIds.length) return prefs.activeAncestorIds;

    const derivedExpandedIds = activeSource.getInitialExpandedIds();
    const derivedActiveAncestorIds = derivedExpandedIds.concat(activeId);

    console.log('[] ancestors', derivedActiveAncestorIds);
    return derivedActiveAncestorIds;
  }, [
    activeSource.isFetching,
    prefs.activeCardId,
    activeSource.getInitialExpandedIds,
  ]);

  const visibleNodes: HierarchyTreeNode[] = useMemo(() => {
    // viewportInitialized avoids wrong duplicated render
    if (!displayableNodes.length || !reactFlow.viewportInitialized) {
      return [];
    }

    /*
     * The following conditions should make a node visible:
     * - Root nodes
     * - Nodes with a parent that is a hidden root node, corresponding to a spotlighted root node with additional supervisors.
     * - Nodes with a parent that is expanded
     */
    const visibleNodes = displayableNodes.filter(
      (node) =>
        node.depth === 1 ||
        node.parent?.id === HIDDEN_ROOT_NODE_ID ||
        (node.parent && derivedExpandedIds.includes(node.parent.id)),
    );

    return visibleNodes.map((node) => {
      return {
        ...node.data,
        isActive: derivedActiveAncestorIds.includes(node.id),
        mode: prefs.cardPreferences.cardClustering ? 'compact' : 'horizontal',
        nodeHeight,
        reflowToken: ui.reflowToken.value,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    displayableNodes,
    reactFlow.viewportInitialized,
    derivedExpandedIds,
    derivedActiveAncestorIds,
    prefs.activeCardId,
    prefs.cardPreferences.cardClustering,
    nodeHeight,
    ui.reflowToken.value,
  ]);
  const visibleHierarchy = useHierarchicalTreeData({ data: visibleNodes });

  const getEdgeStyle = useCallback<
    NonNullable<TreeLayoutOptions['getEdgeStyle']>
  >(
    ({ data: { isActive, groupId } }) => {
      let strokeDasharray = 0;
      let stroke = isActive ? edgeActiveStroke : edgeDefaultStroke;

      if (
        groupId &&
        groupId !== DEFAULT_NODE_GROUP_ID &&
        activeSource.spotlightGroups
      ) {
        strokeDasharray = edgeStrokeDashArray;
        stroke = `var(--ds-color-${getColorForString(
          activeSource.spotlightGroups[groupId],
        )}-7)`;
      }

      return {
        strokeDasharray,
        stroke,
        strokeWidth: edgeStrokeWidth,
      };
    },
    [activeSource.spotlightGroups],
  );

  const layoutOptions: TreeLayoutOptions = useMemo(() => {
    return {
      ...treeLayoutStaticProps,
      getEdgeStyle,
      mode: prefs.cardPreferences.cardClustering ? 'compact' : 'horizontal',
      groups:
        activeSource.spotlightGroups &&
        Object.keys(activeSource.spotlightGroups),
      nodeSize: {
        width: nodeWidth,
        height: nodeHeight,
      },
    };
  }, [
    prefs.cardPreferences.cardClustering,
    activeSource.spotlightGroups,
    nodeWidth,
    nodeHeight,
  ]);

  const [rootNodes, nodes, groupNodes] = useMemo(() => {
    const rootNodes = layout.computeNodesCoordinates(
      visibleHierarchy.rootNodes as TreeNode<BaseData & CardProps>[],
      {
        ...layoutOptions,
        viewport: ui.chartArea.current,
        expandedIds: derivedExpandedIds,
      },
    );
    const nodes = rootNodes.flatMap((node) => node.descendants);
    const groupNodes = layout.mapGroupNodes(nodes, layoutOptions);
    return [rootNodes, nodes, groupNodes];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleHierarchy.rootNodes, JSON.stringify(layoutOptions)]);

  const edges = useMemo(
    () => layout.mapEdges({ treeNodes: rootNodes, groupNodes, layoutOptions }),
    [visibleHierarchy.rootNodes, JSON.stringify(layoutOptions)],
  );

  const translateExtent = useMemo<CoordinateExtent>(
    () =>
      layout.computeTranslateExtent(nodes, {
        nodeSize: layoutOptions.nodeSize ?? defaultTreeLayoutOptions.nodeSize,
        viewport: ui.chartArea.current,
        expandedIds: derivedExpandedIds,
      }),
    [layoutOptions.nodeSize, nodes],
  );

  const nodeSize = useMemo(() => {
    return {
      width: nodeWidth,
      height: nodeHeight,
    };
  }, [nodeWidth, nodeHeight]);

  return {
    rootNodes,
    nodes,
    groupNodes,
    edges,
    translateExtent,
    nodeSize,
  };
};
