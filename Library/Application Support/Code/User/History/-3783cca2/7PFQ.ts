import { type RefObject, useRef, useState, useEffect } from 'react';

type UsePanelTitleReturn = {
  panelRef: RefObject<HTMLDivElement>;
  panelTitle: string;
};
export const usePanelTitle = (title: string): UsePanelTitleReturn => {
  const panelRef = useRef<HTMLDivElement | undefined>();
  const [panelTitle, setPanelTitle] = useState('');

  useEffect(() => {
    const currentRef = panelRef.current;
    const listener = () => {
      const scrollTop = currentRef?.scrollTop || 0;
      if (scrollTop > 70) {
        setPanelTitle(title);
      } else {
        setPanelTitle('');
      }
    };

    panelRef?.current?.addEventListener('scroll', listener);
    return () => panelRef?.current?.removeEventListener('scroll', listener);
  }, [title]);

  return { panelRef: panelRef as UsePanelTitleReturn['panelRef'], panelTitle };
};
