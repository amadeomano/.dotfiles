import { type RefObject, useEffect } from 'react';

export const usePanelTitle = ({
  setTitle,
  panelRef,
  title,
}: {
  setTitle: (title: string) => void;
  panelRef: RefObject<HTMLElement>;
  title: string;
}) => {
  useEffect(() => {
    const listener = () => {
      const scrollTop = panelRef?.current?.scrollTop || 0;
      if (scrollTop > 100) {
        setTitle(title);
      } else {
        setTitle('');
      }
    };

    panelRef?.current?.addEventListener('scroll', listener);
    return panelRef?.current?.addEventListener('scroll', listener);
  }, [panelRef, panelRef?.current?.scrollTop, setTitle]);
};
