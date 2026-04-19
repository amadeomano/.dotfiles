import { type BulkActionsConfig } from 'designSystem/component/bulk-actions';
import { icons } from 'designSystem/component/icon';

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
      },
      {
        name: 'Remove from group',
        type: 'item',
      },
    ],
  },
  {
    icon: icons.coinStack,
    isEnabled: false,
    name: 'Add salary',
    type: 'item',
    variant: 'default',
  },
  {
    icon: icons.coinStack,
    isEnabled: false,
    name: 'Add pension',
    type: 'item',
    variant: 'default',
  },
  {
    icon: icons.trash,
    isEnabled: true,
    name: 'Delete',
    type: 'item',
    variant: 'default',
  },
];
