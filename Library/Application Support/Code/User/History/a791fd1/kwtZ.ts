import { useQuery } from '@tanstack/react-query';
import { create, windowScheduler } from '@yornaath/batshit';
import { useAuthContext } from '@personio-web/auth-context';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { ListOrgUnitMembers, type ListOrgUnitsQueryResult } from '../..';

type Query = {
  property: 'department.id' | 'team.id';
  id: string;
  companyId: number;
};

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];
type Filter = { property: Query['property']; value: string };

const getFilterFor = (orgUnit?: OrgUnit): Filter | null => {
  if (!orgUnit) return null;

  if (
    orgUnit.type === 'ORG_UNIT_TYPE_TEAM' &&
    orgUnit.teamId?.__typename === 'protocore_hrteamid_TeamId_v1'
  ) {
    return { property: 'team.id', value: orgUnit.teamId.id };
  }

  if (
    orgUnit.type === 'ORG_UNIT_TYPE_DEPARTMENT' &&
    orgUnit.departmentId?.__typename ===
      'protocore_hrdepartmentid_DepartmentId_v1'
  ) {
    return { property: 'department.id', value: orgUnit.departmentId.id };
  }

  return null;
};

const getEmployeePropertyFor = (queryProperty: Filter['property']) => {
  switch (queryProperty) {
    case 'department.id':
      return 'department';
    case 'team.id':
      return 'team';
  }
};

const batcher = create({
  fetcher: async (queries: Query[]) => {
    const ids = queries.map((q) => `'${q.id}'`).join(',');
    const companyId = queries[0].companyId;

    return goferRequest({
      operation: ListOrgUnitMembers,
      options: {
        companyId,
        variables: { filter: `${queries[0].property} in [${ids}]`, companyId },
      },
    });
  },
  resolver: (result, query) => {
    const property = getEmployeePropertyFor(query.property);
    return result.data?.membersData?.employmentsList.filter(
      (employment) => employment[property]?.value?.id == query.id,
    );
  },
  scheduler: windowScheduler(100),
});

const DURATION_10_MINUTES = 10 * 60 * 1000;
export const useOrgUnitMemberData = (orgUnit?: OrgUnit) => {
  const { companyId } = useAuthContext();

  const filter = getFilterFor(orgUnit);

  return useQuery({
    queryKey: ['OrgUnitMembers', filter?.property, filter?.value],
    queryFn: () =>
      batcher.fetch({
        companyId,
        property: filter!.property,
        id: filter!.value,
      }),
    enabled: !!(filter?.property && filter?.value),
    staleTime: DURATION_10_MINUTES,
    cacheTime: DURATION_10_MINUTES,
  });
};
