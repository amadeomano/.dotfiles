import { useQuery } from '@tanstack/react-query';
import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnitAllMemberIds, type ListOrgUnitsQueryResult } from '../..';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type Query = { orgUnit: OrgUnit; companyId: number };

const MAX_CARDS_IN_BATCH = 50;
const MAX_MEMBERS_PER_ORG_UNIT = 2;

type OrgUnitData = { id: string; type: 'department' | 'team' } | undefined;
const getOrgUnitData = (): OrgUnitData => {
  const data = cardData.data;
  if (!data) return undefined;
  if (data.type === 'ORG_UNIT_TYPE_UNSPECIFIED') return undefined;

  let orgUnitId: number | undefined;

  if (
    data.departmentId?.__typename === 'protocore_hrdepartmentid_DepartmentId_v1'
  ) {
    orgUnitId = parseInt(data.departmentId.id);
  } else if (data.teamId?.__typename === 'protocore_hrteamid_TeamId_v1') {
    orgUnitId = parseInt(data.teamId.id);
  }

  return orgUnitId && !Number.isNaN(orgUnitId) ? orgUnitId : undefined;
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
  return useQuery({
    queryKey: ['OrgUnitCard', orgUnit.id],
    queryFn: () => batcher.fetch({ orgUnit, companyId }),
    enabled: !!orgUnit.id,
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
