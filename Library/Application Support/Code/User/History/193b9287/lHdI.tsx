import { forwardRef } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import styles from '../styles.module.scss';
import { type InfoPicker } from '../types';

export const TabBar = forwardRef<HTMLDivElement, InfoPicker>(
  ({ list, selected, onSelect }, ref) => {
    return (
      <Tabs
        value={selected}
        onValueChange={onSelect}
        className={styles.tabBarGap}
        ref={ref}
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
