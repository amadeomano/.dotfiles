import { useAuthContext } from '@personio-web/auth-context';
import {
  useInfiniteListOrgUnitMembers,
  type ListOrgUnitMembersQueryResult,
} from '@personio-web/employees-organizations-gofer';
import { type OrgUnitResult } from '../../types';
import { getOrgUnitId } from '../../utils/getOrgUnitId';

export const MEMBERS_LIST_PAGE_SIZE = 20;
export type Member = NonNullable<
  ListOrgUnitMembersQueryResult['membersData']
>['employmentsList'][number];

const getFilterStr = (orgUnit?: OrgUnitResult): string | null => {
  if (!orgUnit) return null;
  if (orgUnit.type === 'ORG_UNIT_TYPE_UNSPECIFIED') return null;

  const type =
    orgUnit.type === 'ORG_UNIT_TYPE_DEPARTMENT' ? 'department' : 'team';
  const orgUnitId = getOrgUnitId(orgUnit, type);

  if (!orgUnitId) return null;

  const typeFilter =
    type === 'department'
      ? `department.id == "${orgUnitId}"`
      : `team.id == "${orgUnitId}"`;

  return `${typeFilter} && status == 'ACTIVE'`;
};

export type OrderBy = 'person.preferred_name' | 'position_title';
type Props = {
  orgUnit?: OrgUnitResult;
  orderBy?: OrderBy;
  enabled?: boolean;
};
export const useListMembers = ({
  orgUnit,
  enabled,
  orderBy = 'person.preferred_name',
}: Props) => {
  const { companyId } = useAuthContext();
  const filterStr = getFilterStr(orgUnit);
  const membersListData = useInfiniteListOrgUnitMembers({
    variables: {
      companyId,
      filter: filterStr,
      orderBy,
      pageSize: MEMBERS_LIST_PAGE_SIZE,
    },
    queryOptions: { enabled: enabled && filterStr !== null },
  });

  return membersListData;
};
