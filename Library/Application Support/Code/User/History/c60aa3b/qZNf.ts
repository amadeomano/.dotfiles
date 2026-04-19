import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { useAuthContext } from '@personio-web/auth-context';
import {
  type ListOrgUnitsQueryResult,
  orgUnitCardDataBatcher,
} from '@personio-web/employees-organizations-gofer';

import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../../../contexts';
import { type CustomisationId } from '../../../../customs/orgunit';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

export const useTotalMembersCount = (orgUnit: OrgUnit) => {
  const { companyId } = useAuthContext();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();

  const descendantIds = useMemo(() => {
    const shouldShowTotalMembers =
      prefs.cardCustomisations.get<CustomisationId>('totalMembers')?.isActive;

    if (!shouldShowTotalMembers) return [];

    return dataSource.completeHierarchyData.data.hierarchy
      .getNode(orgUnit.id.id)
      ?.descendants.map((node) => node.id);
  }, [orgUnit, prefs.cardCustomisations]);

  const descendantData = useQueries({
    queries:
      descendantIds?.map((id) => ({
        queryKey: ['OrgUnitCard', id],
        queryFn: () => orgUnitCardDataBatcher.fetch({ id, companyId }),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // stays fresh for 10 mins
        cacheTime: 10 * 60 * 1000, // persists for 10 mins
      })) ?? [],
  });

  const isLoading = descendantData.some((query) => query.isFetching);
  const isError = descendantData.some((query) => query.isError);

  if (isLoading) return null;
  if (isError) return null;

  return descendantData.reduce(
    (acc, curr) => acc + (curr.data?.directMemberCount ?? 0),
    0,
  );
};
