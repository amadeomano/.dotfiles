import { useRef, useState, useEffect } from 'react';

export const usePanelTitle = ({ title }: { title: string }) => {
  const panelRef = useRef<HTMLElement | undefined>();
  const [, setPanelTitle] = useState(title);

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
  }, [title, panelRef?.current?.scrollTop, setPanelTitle]);

  return panelRef;
};
