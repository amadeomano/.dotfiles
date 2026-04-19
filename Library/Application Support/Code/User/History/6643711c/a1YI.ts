import { useQueryClient } from '@tanstack/react-query';

export const useInvalidateOrgUnitCardDataQuery = () => {
  const queryClient = useQueryClient();

  const invalidateOrgUnitCardDataQuery = (id?: string) => {
    const queryKey = id ? ['OrgUnitCard', id] : ['OrgUnitCard'];
    return queryClient.invalidateQueries({ queryKey });
  };

  return invalidateOrgUnitCardDataQuery;
};
