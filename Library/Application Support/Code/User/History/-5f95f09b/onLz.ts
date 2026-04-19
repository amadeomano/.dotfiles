import { useQuery } from '@tanstack/react-query';
import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnitMemberAvatars } from '../..';

type Query = { personIds: string[]; companyId: number };

const MAX_CARDS_IN_BATCH = 50;

const batcher = create({
  fetcher: async (queries: Query[]) => {
    const ids = queries
      .flatMap((q) => q.personIds)
      .map((id) => `'${id}'`)
      .join(',');

    return goferRequest({
      operation: ListOrgUnitMemberAvatars,
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

export const useOrgUnitFirstMemberIds = (orgUnit: OrgUnit) => {
  const { companyId } = useAuthContext();
  const orgUnitData = getOrgUnitData(orgUnit);

  return useQuery({
    queryKey: ['OrgUnitCard', orgUnit.id],
    queryFn: () =>
      orgUnitData &&
      batcher.fetch({ id: orgUnitData.id, type: orgUnitData.type, companyId }),
    enabled: !!orgUnit,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
