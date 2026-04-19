import { goferClient, useListPersonsByIdsQuery } from 'payroll/data/gofer';

export const usePersonColumnData = (personIds: string[]) => {
  const { data, loading, error } = useListPersonsByIdsQuery({
    client: goferClient,
    variables: {
      personIds,
    },
  });
};
