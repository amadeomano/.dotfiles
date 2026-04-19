import { type RefObject, useEffect, useState } from 'react';

export function longText(times: number) {
  const str = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
  return Array(times)
    .fill(0)
    .map(() => str)
    .join(' ');
}

export const usePanelTitle = ({
  setTitle,
  panelRef,
}: {
  setTitle: (title: string) => void;
  panelRef: RefObject<HTMLElement>;
}) => {
  useEffect(() => {
    const listener = () => {
      const scrollTop = panelRef?.current?.scrollTop || 0;
      if (scrollTop > 100) {
        setTitle('Edit vacation absence type');
      } else {
        setTitle('');
      }
    };

    panelRef?.current?.addEventListener('scroll', listener);
    return panelRef?.current?.addEventListener('scroll', listener);
  }, [panelRef, panelRef?.current?.scrollTop, setTitle]);
};

export function useBreadcrumbSchema(scrollRef: RefObject<HTMLDivElement>) {
  const currentScrollRef = scrollRef;
  const [breadcrumbDepth, setBreadcrumbDepth] = useState(0);
  useEffect(() => {
    const scrollListener = () => {
      const scrollTop = scrollRef.current?.scrollTop;
      let newDepth = 0;
      if (scrollTop && scrollTop > 50 && scrollTop < 200) {
        newDepth = 1;
      }
      if (scrollTop && scrollTop >= 200) {
        newDepth = 2;
      }
      if (newDepth !== breadcrumbDepth) {
        setBreadcrumbDepth(newDepth);
      }
    };

    const tmpScrollRef = currentScrollRef?.current;
    tmpScrollRef?.addEventListener('scroll', scrollListener);
    return () => {
      tmpScrollRef?.removeEventListener('scroll', scrollListener);
    };
  }, [breadcrumbDepth, currentScrollRef?.current]);
  const schema = [
    { label: 'Employees', id: 'payroll', isVisible: true },
    {
      label: 'Hanno Renner',
      id: 'people',
      isVisible: breadcrumbDepth > 0,
      link: {
        href: '/people/hanno-renner',
      },
    },
    {
      id: 'tabs',
      label: 'Profile',
      isVisible: breadcrumbDepth > 1,
      dropdownItems: [
        {
          label: 'Profile',
          id: 'tab1',
          onClick: () => alert('Profile'),
        },
        {
          label: 'Documents',
          id: 'tab2',
          onClick: () => alert('Documents'),
        },
      ],
    },
  ];
  return { schema };
}
