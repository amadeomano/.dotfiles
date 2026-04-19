import { useCallback, useMemo, useRef, useEffect } from 'react';

import { zoomIdentity } from 'd3-zoom';
import { useTranslation } from 'react-i18next';
import { type Viewport } from 'reactflow';

import { useAmplitude } from '@personio-web/amplitude-provider';
import { useAuthContext } from '@personio-web/auth-context';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { IS_TEST } from '@personio-web/global-constants';
import { toaster } from 'designSystem/component/toaster';

import {
  MIN_CARD_HEIGHT,
  NODE_ATTRIBUTE_HEIGHT,
  NODE_HIGHLIGHT_HEIGHT,
} from '../Card/constants';
import {
  edgeActiveStroke,
  edgeDefaultStroke,
  edgeStrokeDashArray,
  edgeStrokeWidth,
  HIDDEN_ROOT_NODE_ID,
} from '../constants';
import * as Amp from '../constants/amplitude';
import { useOrgChartDataSourceContext, useViewportActions } from '../hooks';
import { OpenPositionsWithoutSupervisorButton } from '../OpenPositionsWithoutSupervisor';
import { OtherPeopleTrigger } from '../OtherPeople';
import {
  TreeLayout,
  useHierarchicalTreeData,
  useTreeLayout,
  useTreeLayoutApi,
} from '../TreeLayout';
import { DEFAULT_NODE_GROUP_ID } from '../TreeLayout/constants';
import { RelationshipType, type TreeLayoutOptions } from '../TreeLayout/types';
import { type HierarchyNode, type HierarchyTreeNode, NodeType } from '../types';
import { TestIds } from '../utils';
import { getColorForString } from '../utils/getColorForString';
import { ViewActionsBar } from '../ViewActionsBar';
import { nodeTypes, nodeWidth, treeLayoutStaticProps } from './constants';
import { type OrgChartTreeProps } from './types';

import styles from './OrgChartTree.module.scss';

export const OrgChartTree = ({
  rootNodes,
  nodes,
  getNode,
  interactive = !IS_TEST,
  attributeIds,
  highlightedAttributeId,
  focusedEmployeeId,
  setFocusedEmployeeId,
  spotlight,
  groups,
  mode = 'compact',
  hidePersonalInfo = false,
  hideAvatars = false,
  hiddenPeopleCount,
  includedRootIds,
  includeOpenPositions = false,
  additionalSupervisorAttributes,
  isFiltering,
}: OrgChartTreeProps) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });
  const { track } = useAmplitude();

  const treeRef = useRef<HTMLDivElement>(null);
  const authContext = useAuthContext();
  const { openDialog } = useDialogContext();
  const dataSource = useOrgChartDataSourceContext();

  const viewportActions = useViewportActions();

  const { viewportInitialized } = useTreeLayout<HierarchyTreeNode>();
  const { getState } = useTreeLayoutApi();

  const restoreViewportFocus = useCallback(async () => {
    if (!focusedEmployeeId && !dataSource.isFiltering) {
      /**
       * hack hack hack:
       * set the focusedEmployeeId as preselected employeeId to avoid panning jumps on the first expansion
       */
      // setFocusedEmployeeId(
      //   dataSource.displayableHierarchy.rootNodes.at(0)?.id ?? null,
      // );
      // setFocusedEmployeeId('');
      return;
    }

    const nodeId = String(spotlight || focusedEmployeeId);
    let viewport: Viewport | null;

    // Case of general filtering
    if (dataSource.isFiltering && !spotlight) {
      const allNodes = dataSource.displayableHierarchy.nodes.map(
        (node) => node.id,
      );
      dataSource.expansionState.setExpanded(allNodes);
      viewport = await viewportActions.fitNodes(allNodes, { animate: false });
    }
    // Case of filtering due to spotlight
    else if (spotlight) {
      viewport = await viewportActions.findAndFocusOnNodeBranch(nodeId, {
        animate: false,
        includeDirectAncestors: true,
      });
    }
    // Case of having a focusedEmployeeId
    else {
      viewport = await viewportActions.findAndFocusOnNodeBranch(nodeId, {
        animate: false,
      });
    }

    /**
     * Hack hack hack
     * our calculation of viewport is async however reactFlow's onInit is not async
     * (ref: https://github.com/xyflow/xyflow/blob/reactflow%4011.11.3/packages/core/src/hooks/useOnInitHandler.ts#L12)
     * Furthermore,
     * since at this moment viewport coordinations are under initialisation, setViewport fails to apply its transition
     * (ref: https://github.com/xyflow/xyflow/blob/reactflow%4011.11.3/packages/core/src/hooks/useViewportHelper.ts#L50)
     * and therefore once mouse wheel event begins, the new transformation will be relative to an incorrect base value
     * (ref: https://github.com/xyflow/xyflow/blob/reactflow%4011.11.3/packages/core/src/container/ZoomPane/index.tsx#L155)
     *
     * Therefore once our promise is resolved we manually transform the underlying d3Zoom instance
     * This way we provide a correct baseline for the further relative transformations
     *
     * The following hack is necessary as long as reactFlow's onInit runs synchronously (first ref link above)
     */
    if (viewport) {
      const finalTransform = zoomIdentity
        .translate(viewport.x, viewport.y)
        .scale(viewport.zoom);
      const d3Selection = getState().d3Selection;
      if (d3Selection)
        getState().d3Zoom?.transform(d3Selection, finalTransform);
    }
  }, [focusedEmployeeId, spotlight, dataSource.isFiltering]);

  const handleOnClick = useCallback(
    async (node: HierarchyNode) => {
      /*
       * Ignores clicks on child nodes of hidden root nodes that correspond to a spotlighted root node with additional supervisors.
       * Ensures the node remains visible and expanded, preventing user actions that could collapse it.
       */
      if (spotlight && node.parent?.id === HIDDEN_ROOT_NODE_ID) {
        return;
      }

      const newActiveNodeIds = node.ancestors.map((ancestor) => ancestor.id);
      let nodeIds: string[] = [];

      if (!node.children) {
        // If node is a leaf, make it active
        newActiveNodeIds.push(node.id);
      } else if (
        dataSource.expansionState.expanded.includes(node.id) &&
        (!dataSource.activeNodesState.activeNodeIds.includes(node.id) ||
          node.children.some((child) =>
            dataSource.activeNodesState.activeNodeIds.includes(child.id),
          ))
      ) {
        // If node is expanded, but not active, make it active
        // If node is expanded and has active children, reset the active line to it
        newActiveNodeIds.push(node.id);
        console.log('[] pushed to active without toggle', newActiveNodeIds);
      } else {
        const newExpanded = dataSource.expansionState.handleToggleExpand(node);

        if (newExpanded) {
          newActiveNodeIds.push(node.id);
        }

        nodeIds = [node.id];

        // Focus on node + children when expanded
        if (newExpanded && node.children) {
          nodeIds.push(...node.children.map((item) => item.id));
        }

        // Focus on parent node + siblings when contracting
        if (!newExpanded && node.parent && node.parent.children) {
          nodeIds.push(
            node.parent.id,
            ...node.parent.children.map((item) => item.id),
          );
        }
      }

      const isPersonNode =
        node.data.type === NodeType.Person ||
        node.data.type === NodeType.UnmatchedPerson;
      const nextEmployeeId =
        isPersonNode && newActiveNodeIds.includes(node.id) ? node.id : null;

      setFocusedEmployeeId(nextEmployeeId);
      // cachedFocusedEmployeeId.current = nextEmployeeId;
      dataSource.activeNodesState.setActiveNodeIds(newActiveNodeIds);

      if (nodeIds.length) {
        viewportActions.fitNodes(nodeIds, { allowZoomIn: false });
      }
    },
    [
      // dataSource.expansionState.expanded,
      // dataSource.expansionState.handleToggleExpand,
      dataSource.activeNodesState.activeNodeIds,
      // dataSource.activeNodesState.setActiveNodeIds,
      // spotlight,
      // setFocusedEmployeeId,
      viewportActions.fitNodes,
    ],
  );

  /*
   * View action bar actions
   */
  const resetToHomeView = useCallback(() => {
    const rootNodeIds = rootNodes.map((node) => node.id);
    const childrenNodeIds = rootNodes.flatMap(
      (node) => node.children?.map((child) => child.id) ?? [],
    );

    const shouldUpdateExpand =
      JSON.stringify(dataSource.expansionState.expanded.sort()) !==
      JSON.stringify(rootNodeIds.sort());

    if (shouldUpdateExpand) {
      if (!isFiltering) dataSource.expansionState.setExpanded(rootNodeIds);
      else {
        const allNodeIds = nodes.map((node) => node.id);
        dataSource.expansionState.setExpanded(allNodeIds);
      }
    }

    setFocusedEmployeeId(null);
    // cachedFocusedEmployeeId.current = null;
    dataSource.activeNodesState.setActiveNodeIds([]);
    viewportActions.fitNodes([...rootNodeIds, ...childrenNodeIds], {
      waitForUpdatedPosition: shouldUpdateExpand,
    });
    track(Amp.RESET_TO_HOME);
  }, [
    dataSource.expansionState.expanded,
    dataSource.expansionState.setExpanded,
    viewportActions.fitNodes,
    rootNodes,
    setFocusedEmployeeId,
    track,
    isFiltering,
  ]);

  const focusOnMe = useCallback(() => {
    const nodeId =
      authContext.entityType === 'employee' && String(authContext.employeeId);

    if (!nodeId) {
      toaster.notify({
        variant: 'error',
        title: t('node.title'),
        description: t('node.description'),
        showCloseButton: true,
      });
      return;
    }

    const node = nodeId && getNode(nodeId);

    if (!node) {
      openDialog('org-chart.remove-filters', { employeeId: nodeId });
      return;
    }

    setFocusedEmployeeId(nodeId);
    // cachedFocusedEmployeeId.current = nodeId;
    viewportActions.fitNodeBranch(node);
    track(Amp.FOCUSED_ON_ME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authContext,
    focusedEmployeeId,
    viewportActions.fitNodeBranch,
    getNode,
    openDialog,
    setFocusedEmployeeId,
    track,
  ]);

  /*
   * Map nodes
   */

  const nodeHeight = useMemo(() => {
    let height = MIN_CARD_HEIGHT;

    if (attributeIds?.length) {
      height += NODE_ATTRIBUTE_HEIGHT * attributeIds.length;
    }

    if (highlightedAttributeId) {
      height += NODE_HIGHLIGHT_HEIGHT;
    }

    return height;
  }, [attributeIds, highlightedAttributeId]);

  const visibleNodes: HierarchyTreeNode[] = useMemo(() => {
    // viewportInitialized avoids wrong duplicated render
    if (!nodes.length || !viewportInitialized) {
      return [];
    }

    /*
     * The following conditions should make a node visible:
     * - Root nodes
     * - Nodes with a parent that is a hidden root node, corresponding to a spotlighted root node with additional supervisors.
     * - Nodes with a parent that is expanded
     */
    const visibleNodes = nodes.filter(
      (node) =>
        node.depth === 1 ||
        node.parent?.id === HIDDEN_ROOT_NODE_ID ||
        (node.parent &&
          dataSource.expansionState.expanded.includes(node.parent.id)),
    );

    return visibleNodes.map((node) => {
      const { descendants, children, data } = node;

      let totalPeopleCount = node.descendants.length - 1; // Remove own item from descendants count
      let directPeopleCount = node.childrenCount;
      let totalPositionsCount = 0;
      let directPositionsCount = 0;

      // Split report count by node type if open positions are being displayed
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
      if (spotlight && spotlight === node.id) {
        const subordinatesCount =
          children?.filter(
            (child) =>
              child.data?.group?.relationshipType === RelationshipType.Child,
          )?.length || 0;

        totalPeopleCount = totalPeopleCount - subordinatesCount;
        directPeopleCount = directPeopleCount - subordinatesCount;
      }

      // When filtering we need to count unmatched people and remove from counters
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

      return {
        ...data,
        attributeIds,
        highlightedAttributeId,
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
        isFocused: spotlight === node.id || focusedEmployeeId === node.id,
        isIncluded: includedRootIds?.includes(node.id),
        isActive: dataSource.activeNodesState.activeNodeIds.includes(node.id),
        onClick: () => handleOnClick(node),
        mode,
        hidePersonalInfo,
        hideAvatars,
        additionalSupervisorAttributes,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nodes,
    nodeHeight,
    viewportInitialized,
    dataSource.expansionState.expanded,
    dataSource.activeNodesState.activeNodeIds,
    handleOnClick,
    attributeIds,
    highlightedAttributeId,
    focusedEmployeeId,
    setFocusedEmployeeId,
    mode,
    hidePersonalInfo,
    hideAvatars,
    includedRootIds,
    includeOpenPositions,
  ]);

  const getEdgeStyle = useCallback<
    NonNullable<TreeLayoutOptions['getEdgeStyle']>
  >(
    ({ data: { isActive, groupId } }) => {
      let strokeDasharray = 0;
      let stroke = isActive ? edgeActiveStroke : edgeDefaultStroke;

      if (groupId && groupId !== DEFAULT_NODE_GROUP_ID && groups) {
        strokeDasharray = edgeStrokeDashArray;
        stroke = `var(--ds-color-${getColorForString(groups[groupId])}-7)`;
      }

      return {
        strokeDasharray,
        stroke,
        strokeWidth: edgeStrokeWidth,
      };
    },
    [groups],
  );

  const { rootNodes: visibleRootNodes } =
    useHierarchicalTreeData<HierarchyTreeNode>({
      data: visibleNodes,
    });

  return (
    <div className={styles.orgChartTree} ref={treeRef}>
      <TreeLayout
        {...treeLayoutStaticProps}
        getEdgeStyle={getEdgeStyle}
        interactive={interactive}
        mode={mode}
        groups={groups && Object.keys(groups)}
        rootNodes={visibleRootNodes}
        nodeTypes={nodeTypes}
        nodeSize={{
          width: nodeWidth,
          height: nodeHeight,
        }}
        onInit={restoreViewportFocus}
      />
      <div className={styles.viewActionsBarWrapper}>
        <OtherPeopleTrigger hiddenPeopleCount={hiddenPeopleCount} />
        {includeOpenPositions && <OpenPositionsWithoutSupervisorButton />}
        <ViewActionsBar
          onFocusOnMe={focusOnMe}
          onExpandAllCards={() => undefined} // TODO: Implement onExpandAllCards
          onResetToHomeView={resetToHomeView}
          metadata={{ testId: TestIds.FloatingActionBar }}
        />
      </div>
    </div>
  );
};
