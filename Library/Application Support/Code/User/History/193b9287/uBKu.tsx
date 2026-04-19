import { type FC } from 'react';
import { Tabs } from 'designSystem/component/tabs';
import { type InfoPicker } from '../types';
import styles from '../styles.module.scss';

export const TABBAR_PROPERTY = '--payroll-layout-tabbar-location';

const setTabbarLocation = (tabBarElement: HTMLDivElement | null) => {
  const distanceFromTop = tabBarElement
    ? tabBarElement.getBoundingClientRect().top
    : null;

  if (distanceFromTop === null)
    document.documentElement.style.removeProperty(TABBAR_PROPERTY);
  else
    document.documentElement.style.setProperty(
      TABBAR_PROPERTY,
      `${distanceFromTop}px`,
    );

  console.log('distanceFromTop', distanceFromTop);
};

export const getTabbarLocation = (defaultLocation?: number): number => {
  const rootStyles = getComputedStyle(document.documentElement);
  const distance = rootStyles.getPropertyValue(TABBAR_PROPERTY);
  const numericLocation = parseFloat(distance.trim());
  return Number.isNaN(numericLocation) ? defaultLocation : numericLocation;
};

export const TabBar: FC<InfoPicker> = ({ list, selected, onSelect }) => {
  return (
    <div ref={setTabbarLocation}>
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
