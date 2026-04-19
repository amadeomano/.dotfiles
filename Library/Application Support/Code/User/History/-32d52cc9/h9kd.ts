import { useRef } from 'react';
import {} form './useScrolledPast';

const useScrollController = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrolledPastTitle = useScrolledPast(pageRef, titleRef);

  return { pageRef, tabsRef };
};
