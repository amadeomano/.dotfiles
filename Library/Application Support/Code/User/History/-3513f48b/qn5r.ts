import { goferClient, useListPersonsByIdsQuery } from 'payroll/data/gofer';

export const usePersonColumnData = (employeeIds: number[]) => {
  const { data, loading, error } = useListPersonsByIdsQuery({
    client: goferClient,
    variables: {
      ids: employeeIds,
    },
  });
};
