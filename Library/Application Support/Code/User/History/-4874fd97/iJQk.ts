import { type BulkActionsConfig } from 'designSystem/component/bulk-actions';
import { icons } from 'designSystem/component/icon';

export type BulkAction =
  | 'ADD_TO_GROUP'
  | 'REMOVE_FROM_GROUP'
  | 'ADD_SALARY'
  | 'ADD_PENSION'
  | 'PAY_OFF_CYCLE'
  | 'EMAIL';
type ActionHandler = (action: BulkAction, items: string[] | undefined) => void;

export const bulkActionsConfig: BulkActionsConfig[] = [
  {
    icon: icons.circles2Overlapping,
    isEnabled: true,
    name: 'Paygroup',
    type: 'dropdown',
    variant: 'default',
    subItems: [
      {
        name: 'Add to group',
        type: 'item',
        onClick: (items) => console.log('[] selected', items),
      },
      {
        name: 'Remove from group',
        type: 'item',
      },
    ],
  },
  {
    icon: icons.coinStack,
    isEnabled: true,
    name: 'Add salary',
    type: 'item',
    variant: 'default',
  },
  {
    icon: icons.coinStack,
    isEnabled: true,
    name: 'Add pension',
    type: 'item',
    size: 'large',
    variant: 'default',
  },
  {
    icon: icons.arrowTriangleBranch,
    isEnabled: true,
    name: 'Pay off-cycle',
    type: 'item',
    size: 'large',
    variant: 'default',
  },
  {
    icon: icons.atSign,
    isEnabled: true,
    name: 'Email',
    type: 'item',
    variant: 'default',
  },
];
