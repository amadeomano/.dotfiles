import { type NodeProps } from '../TreeLayout';
import { type HierarchyTreeNode } from '../types';
import { TestIds } from '../utils';
import { OrgUnitCard } from '../sources/cards/OrgUnitCard/OrgUnitCard';
import { Node } from './Node';

export const OrgUnitNode = ({ data }: NodeProps<HierarchyTreeNode>) => {
  console.log('[] node', data.id);
  return (
    <Node metadata={{ testId: `${TestIds.Node}-${data.type}` }}>
      <OrgUnitCard id={data.id} />
    </Node>
  );
};
