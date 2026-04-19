import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';

import { BreadcrumbSchemaItem } from 'designSystem/component/page-shell';
import {
  getParams,
  setParam,
  createUrl,
  commitNavigation,
} from '../../../../utils/navigationParams';

export const useLegalEntitiesBreadcrumb = (): BreadcrumbSchemaItem | null => {
  const { data: legalEntities, isLoading, error } = useLegalEntities();
  const router = useRouter();
  const { legalEntityId } = getParams(router.query);

  // if the legal entities are initially loaded (or change), navigate to the legal entity from the query (if it exists)
  useEffect(() => {
    if (legalEntities) {
      const exists = legalEntities.find((le) => le.id === legalEntityId);

      if (!exists || !legalEntityId) {
        const newUrl = createUrl(router, true);
        setParam(newUrl, 'legalEntityId', legalEntities[0].id);
        navigate({ params: { legalEntityId: legalEntities[0].id } });
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
      onClick: () => navigate({ params: { legalEntityId: legalEntity.id } }),
    })),
  };
};
