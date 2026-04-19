import { useRef } from 'react';
import { useScrolledPast } from './useScrolledPast';

const useScrollController = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrolledPastTitle = useScrolledPast(pageRef, 50);
  const scrolledPastTabs = useScrolledPast(pageRef, tabsRef);

  return { pageRef, tabsRef };
};
