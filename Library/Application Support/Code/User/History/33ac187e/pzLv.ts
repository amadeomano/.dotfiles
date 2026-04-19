import { useEffect, useState } from 'react';

import { timer } from 'd3-timer';
import { type Node, useReactFlow } from 'reactflow';

export type UseAnimatedNodesOptions = {
  duration?: number;
};

export function useAnimatedNodes(
  nodes: Node[],
  { duration = 300 }: UseAnimatedNodesOptions = {},
) {
  const { getNode } = useReactFlow();
  const [animatedNodes, setAnimatedNodes] = useState(nodes);

  useEffect(() => {
    const transitions = nodes.map((node) => ({
      id: node.id,
      from: getNode(node.id)?.position || node.position,
      to: node.position,
      node,
      position: node.position,
    }));

    const transition = timer((elapsed) => {
      const scale = elapsed / duration;

      const currentNodes = transitions.map(({ node, from, to }) => {
        return {
          ...node,
          position: {
            x: from.x + (to.x - from.x) * scale,
            y: from.y + (to.y - from.y) * scale,
          },
        };
      });

      setAnimatedNodes(currentNodes);

      if (elapsed >= duration) {
        setAnimatedNodes(nodes);
        transition.stop();
      }
    });

    return () => transition.stop();
  }, [nodes, duration, getNode]);

  return animatedNodes;
}
