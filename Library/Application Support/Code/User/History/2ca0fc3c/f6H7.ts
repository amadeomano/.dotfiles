import { useState } from 'react';
export const TABBAR_PROPERTY = '--payroll-layout-tabbar-location';

export const useTabbarLocation = () => {
  const [tabBarLocation, setLocation] = useState<number | undefined>();

  const setTabbarLocation = (tabBarElement: HTMLDivElement | null) => {
    const breadcrumbHeight = 50;
    const distanceFromTop = tabBarElement
      ? tabBarElement.getBoundingClientRect().top - breadcrumbHeight
      : undefined;

    setLocation(distanceFromTop);
  };

  return { tabBarLocation, setTabbarLocation };
};

export const setTabbarLocation = (tabBarElement: HTMLDivElement | null) => {
  const breadcrumbHeight = 50;
  const distanceFromTop = tabBarElement
    ? tabBarElement.getBoundingClientRect().top - breadcrumbHeight
    : null;

  if (distanceFromTop === null)
    document.documentElement.style.removeProperty(TABBAR_PROPERTY);
  else
    document.documentElement.style.setProperty(
      TABBAR_PROPERTY,
      `${distanceFromTop}px`,
    );
};

export const getTabbarLocation = (defaultLocation: number): number => {
  const rootStyles = getComputedStyle(document.documentElement);
  const distance = rootStyles.getPropertyValue(TABBAR_PROPERTY);
  const numericLocation = parseFloat(distance.trim());
  return Number.isNaN(numericLocation) ? defaultLocation : numericLocation;
};
