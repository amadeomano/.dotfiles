import { useCallback, useState } from 'react';

import type { HierarchyNode } from '../types';

export function useExpansionState(initialState: string[]): {
  expanded: string[];
  setExpanded: (expanded: string[]) => void;
  handleToggleExpand: (node: HierarchyNode) => boolean;
} {
  const [expanded, setExpanded] = useState<string[]>(initialState);

  /*
   * Toggles the expansion state of the provided node. When contracting,
   * remove the node and its descendants from the expanded state
   */
  const handleToggleExpand = useCallback((node: HierarchyNode) => {
    let newExpanded = false;

    setExpanded((expanded) => {
      let updatedExpanded = [...expanded];

      if (expanded.includes(node.id)) {
        const descendentsIds = node.descendants.map(
          (descendant) => descendant.id,
        );

        updatedExpanded = updatedExpanded.filter(
          (id) => !descendentsIds.includes(id) && id !== node.id,
        );
      } else {
        newExpanded = true;
        updatedExpanded.push(node.id);
      }

      return updatedExpanded;
    });

    return newExpanded;
  }, []);

  return {
    expanded,
    setExpanded,
    handleToggleExpand,
  };
}
