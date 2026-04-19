import { type BulkActions } from 'designSystem/component/bulk-actions';

export const bulkActions: BulkActions = {
  actions: [
    {
      icon: 'sort',
      isEnabled: true,
      name: 'Sort',
      onClick: (items) => console.log('clicked Sort, selected items:', items),
      type: 'item',
      variant: 'default',
    },
    {
      icon: 'calendar',
      isEnabled: false,
      name: 'Invite',
      onClick: (items) => console.log('clicked Invite, selected items:', items),
      type: 'item',
      variant: 'default',
    },
    {
      icon: 'star',
      name: 'Tag',
      onClick: (items) => console.log('clicked Tag, selected items:', items),
      type: 'item',
      variant: 'default',
    },
    {
      type: 'separator',
    },
    {
      icon: 'trash',
      isEnabled: true,
      name: 'Delete',
      onClick: (items) => console.log('clicked Delete, selected items:', items),
      type: 'item',
      variant: 'destructive',
    },
    {
      type: 'separator',
    },
    {
      icon: 'ellipsis',
      name: 'More',
      side: 'top',
      subItems: [
        {
          icon: 'calendar',
          isEnabled: true,
          name: 'Invite',
          onClick: (items) =>
            console.log('clicked Invite, selected items:', items),
          type: 'item',
          variant: 'default',
        },
        {
          icon: 'star',
          name: 'Tag',
          onClick: (items) =>
            console.log('clicked Tag, selected items:', items),
          type: 'item',
          variant: 'default',
        },
        {
          icon: 'trash',
          isEnabled: true,
          name: 'Delete',
          onClick: (items) =>
            console.log('clicked Delete, selected items:', items),
          type: 'item',
          variant: 'destructive',
        },
      ],
    },
  ],
};
