import { type BreadcrumbSchema } from 'designSystem/component/page';
import { useEffect, useMemo, useState } from 'react';
import { type InfoPicker } from '../types';

export const getSchemasFn =
  (title: string, legalEntities?: InfoPicker, tabs?: InfoPicker) =>
  (breadcrumbDepth: number): BreadcrumbSchema =>
    [
      { label: title, id: 'title', isVisible: breadcrumbDepth > 0 },
      {
        id: 'legalEntities',
        label: legalEntities?.placeholder ?? '',
        isVisible: legalEntities && breadcrumbDepth > 0,
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
        isVisible: tabs && breadcrumbDepth > 1,
        dropdownItems: tabs?.list.map(({ key, label }) => ({
          label,
          id: key,
          onClick: () => tabs.onSelect(key),
          selected: key === tabs.selected,
        })),
      },
    ];

export type AnchorPastState = {
  title: boolean;
  tabs: boolean;
};

type Props = {
  scrolledPast: AnchorPastState;
  schemasFn: (depth: number) => BreadcrumbSchema;
};
export const useBreadcrumbSchema = ({ scrolledPast, schemasFn }: Props) => {
  const [breadcrumbDepth, setBreadcrumbDepth] = useState(0);

  useEffect(() => {
    let newDepth = 0;
    if (scrolledPast.title) {
      newDepth = 1;
    }
    if (scrolledPast.tabs) {
      newDepth = 2;
    }
    if (newDepth !== breadcrumbDepth) {
      setBreadcrumbDepth(newDepth);
    }
  }, [scrolledPast, breadcrumbDepth]);

  const schema = useMemo(
    () => schemasFn(breadcrumbDepth),
    [breadcrumbDepth, schemasFn],
  );

  return { schema, breadcrumbDepth };
};
