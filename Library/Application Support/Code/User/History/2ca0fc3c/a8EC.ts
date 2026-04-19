import { useState } from 'react';

export const useTabbarLocation = (defaultLocation = 150) => {
  const [tabBarLocation, setLocation] = useState(defaultLocation);

  const setTabbarLocation = (tabBarElement: HTMLElement | null) => {
    const breadcrumbHeight = 50;
    const distanceFromTop = tabBarElement
      ? tabBarElement.getBoundingClientRect().top - breadcrumbHeight
      : undefined;

    console.log('[] distance', distanceFromTop);

    setLocation(distanceFromTop ?? defaultLocation);
  };

  return { tabBarLocation, setTabbarLocation };
};
