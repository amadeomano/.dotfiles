import { toaster } from 'designSystem/component/toaster';
// import { useListLegalEntities } from 'employeesOrganizations/data/legal-entities';
import { useLegalEntities as useListLegalEntities } from '@personio-web/payroll-data-payroll-integration-context';

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
  fullLegalEntities?.map((data) => {
    legalEntities[data.id] = {
      id: data.id,
      name: data.name,
    };
  });

  return { legalEntities, isFetching, isError, error };
}
