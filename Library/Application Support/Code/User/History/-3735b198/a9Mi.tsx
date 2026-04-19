import { type BreadcrumbSchema } from 'designSystem/component/page';
import { type RefObject, useState, useEffect } from 'react';
import { type InfoPicker } from './types';

const getSchemas =
  (title: string, legalEntities: InfoPicker, tabs: InfoPicker) =>
  (breadcrumbDepth: number): BreadcrumbSchema =>
    [
      { label: title, id: 'title', isVisible: true },
      {
        id: 'legalEntities',
        label: 'Legal Entities'
        isVisible: breadcrumbDepth > 0,
        dropdownItems: legalEntities.list.map(({ key, label }) => ({
          label,
          id: key,
          onClick: () => legalEntities.onSelect(key),
          selected: key === legalEntities.selected
        })),
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
