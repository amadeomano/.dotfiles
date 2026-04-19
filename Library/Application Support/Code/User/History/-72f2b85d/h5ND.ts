import { useQuery } from '@tanstack/react-query';
import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnitAllMemberIds } from '../..';

type OrgUnitType = 'department' | 'team';
type Query = { id: string; type: OrgUnitType; companyId: number };

const MAX_CARDS_IN_BATCH = 50;
const MAX_MEMBERS_PER_ORG_UNIT = 2;

const batcher = create({
  fetcher: async (queries: Query[]) => {
    const ids = queries.map((q) => `'${q.id}'`).join(',');
    const type = queries[0].type;

    const filterCol = type === 'department' ? 'department.id' : 'team.id';
    return goferRequest({
      operation: ListOrgUnitAllMemberIds,
      options: {
        companyId: queries[0].companyId,
        variables: {
          filter: `${filterCol} in [${ids}]`,
        },
      },
    });
  },
  resolver: (result, query) =>
    result.data?.membersData?.employmentsList
      .filter((item) =>
        query.type === 'department'
          ? item.department?.value?.id === query.id
          : item.team?.value?.id === query.id,
      )
      .slice(0, MAX_MEMBERS_PER_ORG_UNIT),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 100,
    maxBatchSize: MAX_CARDS_IN_BATCH,
  }),
});

export const useOrgUnitTwoMemberIds = (id: string, type: OrgUnitType) => {
  const { companyId } = useAuthContext();
  return useQuery({
    queryKey: ['OrgUnitCard', id],
    queryFn: () => batcher.fetch({ id, type, companyId }),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
