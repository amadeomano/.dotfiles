import { Tabs } from 'designSystem/component/tabs';
import { type FC, type RefObject } from 'react';
import styles from '../styles.module.scss';
import { type InfoPicker } from '../types';

type Props = InfoPicker & {
  layoutRef?: RefObject<HTMLDivElement>;
};
export const TabBar: FC<Props> = ({ list, selected, onSelect, layoutRef }) => {
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
};
