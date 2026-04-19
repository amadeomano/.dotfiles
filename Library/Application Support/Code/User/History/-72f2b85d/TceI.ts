import { useQuery } from '@tanstack/react-query';
import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnitAllMemberIds, type ListOrgUnitsQueryResult } from '../..';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type OrgUnitData = { id: number; type: 'department' | 'team' };
type Query = { id: number; type: OrgUnitData['type']; companyId: number };

const MAX_CARDS_IN_BATCH = 50;
const MAX_MEMBERS_PER_ORG_UNIT = 2;

const getOrgUnitData = (orgUnit: OrgUnit): OrgUnitData | undefined => {
  if (orgUnit.type === 'ORG_UNIT_TYPE_UNSPECIFIED') return undefined;

  let id: number | undefined;
  let type: OrgUnitData['type'] | undefined;

  if (
    orgUnit.departmentId?.__typename ===
    'protocore_hrdepartmentid_DepartmentId_v1'
  ) {
    id = parseInt(orgUnit.departmentId.id);
    type = 'department';
  } else if (orgUnit.teamId?.__typename === 'protocore_hrteamid_TeamId_v1') {
    id = parseInt(orgUnit.teamId.id);
    type = 'team';
  }

  if (!id || !Number.isNaN(id) || !type) return undefined;
  return { id, type };
};

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

export const useOrgUnitTwoMemberIds = (orgUnit: OrgUnit) => {
  const { companyId } = useAuthContext();
  const orgUnitData = getOrgUnitData(orgUnit);
  const { id, type } = orgUnitData;

  return useQuery({
    queryKey: ['OrgUnitCard', orgUnit.id],
    queryFn: () => batcher.fetch({ orgUnit, companyId }),
    enabled: !!orgUnit.id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
