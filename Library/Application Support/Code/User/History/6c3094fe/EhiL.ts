import { getRectOfNodes } from 'reactflow';

import { type ComputeTranslateExtentFunction } from '../types';

/*
 * Maintains the chart in view by restricting the area the user can navigate
 * For grid layout: prevents horizontal scrolling but allows vertical scrolling for reflow
 */
export const computeTranslateExtent: ComputeTranslateExtentFunction = (
  nodes,
  layoutOptions,
) => {
  const { x, y, width, height } = getRectOfNodes(nodes);
  const { width: nodeWidth, height: nodeHeight } = layoutOptions.nodeSize;

  const top = y;
  const bottom = top + height + nodeHeight;
  const left = x;
  const right = left + width + nodeWidth;
  const bottomSpacing = 40;

  return [
    [0, 0],
    [right, bottom + bottomSpacing],
  ];
};
