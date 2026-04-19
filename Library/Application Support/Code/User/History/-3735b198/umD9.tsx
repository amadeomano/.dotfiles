import { type RefObject, useState } from 'react';

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
  return { schema };
}
