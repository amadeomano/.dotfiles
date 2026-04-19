import { type FC, type RefObject, forwardRef } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import styles from '../styles.module.scss';
import { type InfoPicker } from '../types';

type Props = InfoPicker & {
  ref?: RefObject<HTMLDivElement>;
};
export const TabBar: FC<Props> = forwardRef(
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
