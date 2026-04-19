import React from 'react';

import { createSlots } from '@personio-web/design-system-utils';
import type { ControlBarComponent } from '@personio-web/design-system-component-control-bar-types';
import { Inline } from '@personio-web/design-system-component-layout';
import { ScrollArea } from '@personio-web/design-system-component-scroll-area';

import { Triggers } from './trigger/Triggers';
import { Controls } from './controls';

import styles from './ControlBar.module.scss';

const CONTROL_BAR_ERROR_MESSAGE =
  'Control bar only supports children of type ...';

const ControlBar: ControlBarComponent = ({ children, table = {} }) => {
  const { slots, rest: unmatchedComponents } = createSlots(children, {
    columns: Controls.Columns,
    dataset: Controls.Dataset,
    filters: Controls.Filter,
    group: Controls.Group,
    layout: Controls.Layout,
    more: Controls.More,
    primary: Controls.Primary,
    search: Controls.Search,
    share: Controls.Share,
    sort: Controls.Sort,
    views: Controls.Views,
    savedViews: Controls.SavedViews,
    custom: [Controls.Custom],
  });

  if (unmatchedComponents.length > 0) {
    throw new Error(CONTROL_BAR_ERROR_MESSAGE);
  }

  return (
    <Inline
      space={'gap-default'}
      align={'space-between'}
      className={styles.controlBar}
    >
      <ScrollArea>
        <Inline space={'gap-small'} className={styles.actions}>
          <Inline
            space={'gap-small'}
            alignVertical={'center'}
            className={styles.datasets}
          >
            {slots.savedViews}
            {slots.dataset}
            {slots.views}
          </Inline>

          {slots.custom}
          {slots.layout}

          {slots.group && React.cloneElement(slots.group, { ...table.group })}

          {slots.columns &&
            React.cloneElement(slots.columns, {
              ...table.columns,
            })}

          {slots.sort && React.cloneElement(slots.sort, { ...table.sort })}

          {slots.filters &&
            React.cloneElement(slots.filters, { ...table.filter })}
        </Inline>
      </ScrollArea>

      <Inline space={'gap-small'}>
        {slots.search && React.cloneElement(slots.search, { ...table.search })}
        {slots.share}
        {slots.more}
        {slots.primary}
      </Inline>
    </Inline>
  );
};

export { ControlBar, Controls, Triggers };
