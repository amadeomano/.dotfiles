import { useMemo } from 'react';

import { useFilterOrgUnitsByEmployees } from '@personio-web/employees-organizations-gofer';

import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../../contexts';
import { type SourceData } from '../../../../sources/data/types';

type LookedUpOrgUnit = {
  node:
    | SourceData['completeHierarchyData']['data']['hierarchy']['nodes'][number]
    | undefined;
  isFetched: boolean;
  isLoading: boolean;
};

export const useGetOrgUnitByEmployeeId = (
  employeeId: string | null,
): LookedUpOrgUnit => {
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();

  const orgUnitsByEmployee = useFilterOrgUnitsByEmployees({
    variables: {
      filterExp: `person_id == '${employeeId}'`,
      includeDepartment: true,
      includeTeam: true,
    },
    queryOptions: { enabled: employeeId !== null },
  });

  const orgUnitId = useMemo(() => {
    if (prefs.source === 'Department')
      return orgUnitsByEmployee.data?.data?.result?.employmentsList.at(0)
        ?.department?.id.id;
    else if (prefs.source === 'Team')
      return orgUnitsByEmployee.data?.data?.result?.employmentsList.at(0)?.team
        ?.id.id;
    return undefined;
  }, [orgUnitsByEmployee.data]);

  return {
    node: orgUnitId
      ? dataSource.displayableHierarchy.getNode(orgUnitId)
      : undefined,
    isLoading: orgUnitsByEmployee.isFetching,
    isFetched: orgUnitsByEmployee.isFetched,
  };
};
