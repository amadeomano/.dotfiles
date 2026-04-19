import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';

import { BreadcrumbSchemaItem } from '@personio-web/design-system-component-page-shell-types';
import {
  createUrl,
  getParams,
  setParam,
  commitNavigation,
} from '../../../../utils/navigationParams';

export const useLegalEntitiesBreadcrumb = (): BreadcrumbSchemaItem | null => {
  const router = useRouter();
  const { data: legalEntities, isLoading, error } = useLegalEntities();
  const { legalEntityId } = getParams(router.query);

  // if the legal entities are initially loaded (or change), navigate to the legal entity from the query (if it exists)
  useEffect(() => {
    if (legalEntities) {
      const exists = legalEntities.find((le) => le.id === legalEntityId);

      if (!exists || !legalEntityId) {
        const newURL = createUrl(router, true);
        setParam(newURL, 'legalEntityId', legalEntities[0].id);
        commitNavigation(router, newURL);
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legalEntities, legalEntityId]);

  if (isLoading) {
    return {
      loadingWidth: 100,
    };
  }

  const hasOnlyOneLegalEntity = legalEntities && legalEntities.length === 1;

  if (error || !legalEntities || hasOnlyOneLegalEntity) return null;

  const selectedOption =
    legalEntities.find((legalEntity) => legalEntity.id === legalEntityId) ||
    legalEntities[0];

  return {
    id: 'legal_entities',
    label: selectedOption.name,
    isVisible: true,
    dropdownItems: legalEntities.map((legalEntity) => ({
      id: String(legalEntity.id),
      label: legalEntity.name,
      onClick: () => {
        if (legalEntityId === legalEntity.id) return;
        const newURL = createUrl(router, true);
        newURL.searchParams.set('legalEntityId', legalEntity.id);
        commitNavigation(router, newURL);
      },
    })),
  };
};
