import { useState } from 'react';

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
