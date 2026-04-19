import { useRouter } from 'next/router';
import { BreadcrumbSchemaItem } from '@personio-web/design-system-component-page-shell-types';
import { useLegalEntities } from 'payroll/data/payroll-integration-context';
import { useEffect } from 'react';
import { PayrollIntegration } from '../../types/PayrollIntegration';
import {
  getParams,
  setParam,
  createUrl,
  commitNavigation,
} from '../../utils/navigationParams';

export const useLegalEntitiesBreadcrumb = (
  integration: PayrollIntegration,
): BreadcrumbSchemaItem | null => {
  const { data: legalEntities, isLoading, error } = useLegalEntities();
  const router = useRouter();
  const {} = getParams(router.query);
  const {
    navigate,
    params: { legalEntityId },
  } = usePayrollIntegrationSettingsNavigator(integration);

  // if the legal entities are initially loaded (or change), navigate to the legal entity from the query (if it exists)
  useEffect(() => {
    if (legalEntities) {
      const exists = legalEntities.find((le) => le.id === legalEntityId);

      if (!exists || !legalEntityId) {
        // if legal entities exist but the legal entity id from the search params does not exist
        // OR if the search params do not include a legal entity id yet
        // simply load the first legal entity in the list and set the search params accordingly (-> so there's always a value)
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
    dropdownItems: legalEntities.map((legalEntity, index) => ({
      id: String(legalEntity.id),
      label: legalEntity.name,
      onClick: () => navigate({ params: { legalEntityId: legalEntity.id } }),
    })),
  };
};
