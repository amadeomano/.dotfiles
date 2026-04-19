import { useMemo, useRef } from 'react';

import { type CoordinateExtent, ReactFlow } from 'reactflow';

import { IS_TEST } from '@personio-web/global-constants';

import type { BaseData, TreeLayoutProps } from './types';

import { transitionMaxZoom } from '../constants';
import { Viewport } from '../Viewport';
import { nonInteractiveProps, staticReactFlowProps } from './constants';
import { useAnimatedNodes } from './hooks';
import {
  computeTranslateExtent,
  computeTreeCoordinates,
  mapEdges,
  mapGroupNodes,
} from './utils';

import './TreeLayout.module.scss';

export function TreeLayout<T extends BaseData>({
  rootNodes: baseRootNodes,
  nodeTypes,
  interactive = !IS_TEST,
  isExporting,
  onInit,
  ...layoutOptions
}: TreeLayoutProps<T>) {
  const viewport = useRef<HTMLDivElement>(null);

  const [rootNodes, nodes, groupNodes] = useMemo(() => {
    const rootNodes = computeTreeCoordinates(baseRootNodes, layoutOptions);
    const nodes = rootNodes.flatMap((node) => node.descendants);
    const groupNodes = mapGroupNodes(nodes, layoutOptions);
    return [rootNodes, nodes, groupNodes];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRootNodes, JSON.stringify(layoutOptions)]);

  const edges = useMemo(() => {
    console.log('[] edges');
    return mapEdges({ treeNodes: rootNodes, groupNodes, layoutOptions });
  }, [baseRootNodes]);

  const translateExtent = useMemo<CoordinateExtent>(
    () =>
      computeTranslateExtent(nodes, viewport.current, layoutOptions.nodeSize),
    [layoutOptions.nodeSize, nodes],
  );

  const animateGroupNodes = useAnimatedNodes(groupNodes, {
    duration: IS_TEST ? 0 : 200,
  });

  const animatedNodes = useAnimatedNodes(nodes, {
    duration: IS_TEST ? 0 : 200,
  });

  return (
    <Viewport ref={viewport}>
      <ReactFlow
        {...staticReactFlowProps}
        {...(interactive ? {} : nonInteractiveProps)}
        nodes={[...animateGroupNodes, ...animatedNodes]}
        edges={edges}
        translateExtent={translateExtent}
        nodeTypes={nodeTypes}
        onlyRenderVisibleElements={!isExporting}
        // We need to call fitView onInit to ensure the tree fits view after the viewport is initialized.
        // Otherwise, the tree might not fit the view fully after the skeleton is rendered
        onInit={(instance) => {
          onInit?.(instance);
          instance.fitView({ maxZoom: transitionMaxZoom });
        }}
      />
    </Viewport>
  );
}
