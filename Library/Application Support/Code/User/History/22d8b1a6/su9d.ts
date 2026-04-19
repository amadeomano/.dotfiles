import { toaster } from 'designSystem/component/toaster';
import { useListLegalEntities } from 'employeesOrganizations/data/legal-entities';
import { listLegalEntitiesHandlers } from 'payroll/data/payroll-legal-entities/handlers';
import { registerHandlers } from '@personio-web/mocks';

export interface LegalEntityItem {
  id: string;
  name: string;
}

export function useLegalEntities() {
  const {
    data: fullLegalEntities,
    isFetching,
    isError,
    error,
  } = useListLegalEntities();

  if (isError) {
    toaster.notify({
      variant: 'error',
      title: 'Unable to fetch legal entities',
      description: `Error: ${error}`,
      showCloseButton: true,
      duration: 10000,
    });
  }

  const legalEntities: Record<string, LegalEntityItem> = {};
  fullLegalEntities?.legalEntities?.map((data) => {
    legalEntities[data.id] = {
      id: data.id,
      name: data.attributes.name ?? '',
    };
  });

  return { legalEntities, isFetching, isError, error };
}
