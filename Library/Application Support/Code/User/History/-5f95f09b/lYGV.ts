import { useQuery } from '@tanstack/react-query';
import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnitMemberAvatars } from '../..';

type Query = { personIds: string[]; companyId: number };

const MAX_CARDS_IN_BATCH = 50;

const batcher = create({
  fetcher: async (queries: Query[]) => {
    const personIds = queries.flatMap((q) => q.personIds);

    return goferRequest({
      operation: ListOrgUnitMemberAvatars,
      options: {
        companyId: queries[0].companyId,
        variables: {
          companyId: queries[0].companyId,
          personIds,
        },
      },
    });
  },
  resolver: (result, query) =>
    result.data?.membersData?.personsList.filter((item) =>
      query.personIds.includes(item.id),
    ),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 100,
    maxBatchSize: MAX_CARDS_IN_BATCH,
  }),
});

export const useOrgUnitFirstMemberIds = (personIds: string[] | undefined) => {
  const { companyId } = useAuthContext();

  return useQuery({
    queryKey: ['OrgUnitCardFirstAvatars', personIds],
    queryFn: () =>
      orgUnitData &&
      batcher.fetch({ id: orgUnitData.id, type: orgUnitData.type, companyId }),
    enabled: !!orgUnit,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
