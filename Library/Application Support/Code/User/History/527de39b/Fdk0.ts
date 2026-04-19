import { type RefObject, useState, useEffect } from 'react';
import { type BreadcrumbSchema } from 'designSystem/component/page';
import { type InfoPicker } from '../types';

export const getSchemasFn =
  (title: string, legalEntities?: InfoPicker, tabs?: InfoPicker) =>
  (breadcrumbDepth: number): BreadcrumbSchema =>
    [
      { label: title, id: 'title', isVisible: breadcrumbDepth > 0 },
      {
        id: 'legalEntities',
        label: legalEntities?.placeholder ?? '',
        isVisible: breadcrumbDepth > 0,
        dropdownItems: legalEntities?.list.map(({ key, label }) => ({
          label,
          id: key,
          onClick: () => legalEntities.onSelect(key),
          selected: key === legalEntities.selected,
        })),
      },
      {
        id: 'tabs',
        label: tabs?.placeholder ?? '',
        isVisible: breadcrumbDepth > 1,
        dropdownItems: tabs?.list.map(({ key, label }) => ({
          label,
          id: key,
          onClick: () => tabs.onSelect(key),
          selected: key === tabs.selected,
        })),
      },
    ];

export const useBreadcrumbSchema = (
  scrollRef: RefObject<HTMLDivElement>,
  schemasFn: (depth: number) => BreadcrumbSchema,
) => {
  const currentScrollRef = scrollRef;
  const [breadcrumbDepth, setBreadcrumbDepth] = useState(0);
  useEffect(() => {
    console.count('useEffect');
    const scrollListener = () => {
      const scrollTop = scrollRef.current?.scrollTop;
      let newDepth = 0;
      if (scrollTop && scrollTop > 50 && scrollTop < 150) {
        newDepth = 1;
      }
      if (scrollTop && scrollTop >= 150) {
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

  return { schema: schemasFn(breadcrumbDepth), breadcrumbDepth };
};
