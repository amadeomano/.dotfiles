import { useRouter } from 'next/router';
import { BreadcrumbSchemaItem } from '@personio-web/design-system-component-page-shell-types';
import { useLegalEntities } from 'payroll/data/payroll-integration-context';
import { useEffect } from 'react';
import { PayrollIntegration } from '../../types/PayrollIntegration';
import {
  createUrl,
  getParams,
  setParam,
  commitNavigation,
} from '../../../shared/utils/navigationParams';

export const useLegalEntitiesBreadcrumb = (
  integration: PayrollIntegration,
): BreadcrumbSchemaItem | null => {
  const router = useRouter();
  const { data: legalEntities, isLoading, error } = useLegalEntities();
  const { legalEntityId } = getParams(router.query);

  // if the legal entities are initially loaded (or change), navigate to the legal entity from the query (if it exists)
  useEffect(() => {
    if (legalEntities) {
      const exists = legalEntities.find((le) => le.id === legalEntityId);

      if (!exists || !legalEntityId) {
        console.log('loaded n navigating to %d', legalEntities[0].id);
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
    dropdownItems: legalEntities.map((legalEntity, index) => ({
      id: String(legalEntity.id),
      label: legalEntity.name,
      onClick: () => {
        if (legalEntityId === legalEntity.id) return;
        console.log('click n navigating to %d', legalEntity.id);
        const newURL = createUrl(router, true);
        newURL.searchParams.set('legalEntityId', legalEntity.id);
        commitNavigation(router, newURL);
      },
    })),
  };
};
