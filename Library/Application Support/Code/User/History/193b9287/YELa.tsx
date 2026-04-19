import { type FC, type RefObject, forwardRef } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import styles from '../styles.module.scss';
import { type InfoPicker } from '../types';

export const TabBar: FC<InfoPicker> = forwardRef(
  ({ list, selected, onSelect, ref }) => {
    return (
      <Tabs
        value={selected}
        onValueChange={onSelect}
        className={styles.tabBarGap}
        ref={layoutRef}
      >
        <Tabs.List>
          {list.map(({ key, label, count }) => (
            <Tabs.Trigger
              key={key}
              data-test-id={`payroll-${key}`}
              value={key}
              count={count}
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
    );
  },
);
