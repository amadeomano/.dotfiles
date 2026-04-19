import { type BulkActionsConfig } from 'designSystem/component/bulk-actions';
import { icons } from 'designSystem/component/icon';

const bulkActionsConfig: BulkActionsConfig[] = [
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
];
