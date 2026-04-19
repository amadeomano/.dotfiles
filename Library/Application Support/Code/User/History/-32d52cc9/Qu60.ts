import { useRef } from 'react';
import { useScrolledPast } from './useScrolledPast';
import { type AnchorPastState } from '../components/breadcrumbs';

const useScrollController = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrolledPastTitle = useScrolledPast(pageRef, 50);
  const scrolledPastTabs = useScrolledPast(pageRef, tabsRef);

  const scrolledPast: AnchorPastState = {
    title: scrolledPastTitle,
    tabs: scrolledPastTabs,
  };

  return { pageRef, tabsRef };
};
