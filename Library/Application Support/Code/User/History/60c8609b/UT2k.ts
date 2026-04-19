import { useQuery } from '@tanstack/react-query';
import { create, windowScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnits } from '../..';

type Query = { id: string; companyId: number };

export const orgUnitCardDataBatcher = create({
  fetcher: async (queries: Query[]) => {
    const ids = queries
      .map((q) => `'${q.id}'`)
      .slice(0, 10)
      .join(',');
    console.log('[] requesting', ids);
    return goferRequest({
      operation: ListOrgUnits,
      options: {
        companyId: queries[0].companyId,
        variables: {
          companyId: queries[0].companyId,
          filter: `id in [${ids}]`,
          includeDirectMemberCount: true,
          includeDepartmentId: true,
          includeTeamId: true,
          includeLeads: true,
        },
      },
    });
  },
  resolver: (result, query) =>
    result.data?.orgUnits?.orgUnitsList.find((item) => item.id.id === query.id),
  scheduler: windowScheduler(100),
});

export const useOrgUnitCardData = (id: string) => {
  const { companyId } = useAuthContext();

  return useQuery({
    queryKey: ['OrgUnitCard', id],
    queryFn: () => orgUnitCardDataBatcher.fetch({ id, companyId }),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
