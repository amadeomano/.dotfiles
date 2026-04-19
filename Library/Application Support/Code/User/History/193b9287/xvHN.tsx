import { type FC } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import { type InfoPicker } from '../types';
import styles from '../styles.module.scss';

type Props = InfoPicker & { onMount: (el: HTMLElement | null) => void };

export const TabBar: FC<Props> = ({ list, selected, onSelect, onMount }) => {
  return (
    <div ref={onMount}>
      <Tabs
        value={selected}
        onValueChange={onSelect}
        className={styles.tabBarGap}
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
    </div>
  );
};
