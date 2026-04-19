import { type RefObject, useRef, useState, useEffect } from 'react';

type UsePanelTitleReturn = {
  panelRef: RefObject<HTMLDivElement>;
  panelTitle: string;
};
export const usePanelTitle = (title: string): UsePanelTitleReturn => {
  const panelRef = useRef<HTMLDivElement | undefined>();
  const [panelTitle, setPanelTitle] = useState(title);
  console.log('[] title', title, panelRef);

  useEffect(() => {
    const listener = () => {
      const scrollTop = panelRef?.current?.scrollTop || 0;
      console.log('[] scroll top', scrollTop);
      if (scrollTop > 70) {
        setPanelTitle(title);
      } else {
        setPanelTitle('');
      }
    };

    panelRef?.current?.addEventListener('scroll', listener);
    return panelRef?.current?.addEventListener('scroll', listener);
  }, [title, panelRef?.current?.scrollTop, setPanelTitle]);

  return { panelRef: panelRef as UsePanelTitleReturn['panelRef'], panelTitle };
};
