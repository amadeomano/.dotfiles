import { type RefObject, useState, useEffect } from 'react';

export const usePanelTitle = ({
  panelRef,
  title,
}: {
  setTitle: (title: string) => void;
  panelRef: RefObject<HTMLElement>;
  title: string;
}) => {
  const [panelTitle, setPanelTitle] = useState(title);

  useEffect(() => {
    const listener = () => {
      const scrollTop = panelRef?.current?.scrollTop || 0;
      if (scrollTop > 100) {
        setPanelTitle(title);
      } else {
        setPanelTitle('');
      }
    };

    panelRef?.current?.addEventListener('scroll', listener);
    return panelRef?.current?.addEventListener('scroll', listener);
  }, [panelRef, panelRef?.current?.scrollTop, setPanelTitle]);
};
