import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PropertyListItem,
  PropertyListItemLabel,
  PropertyListItemValue,
} from 'designSystem/component/property-list';
import { icons, Icon } from 'designSystem/component/icon';
import { Tooltip } from 'designSystem/component/tooltip';

import { useAuthContext } from '@personio-web/auth-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { type PresetType } from '@personio-web/employees-organizations-util-org-units';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';

import { FeatureFlags } from '../featureFlags';
import { type OrgUnitResult } from '../../types';
import { getOrgUnitId } from '../../utils/getOrgUnitId';
import { EmployeeListLink } from '../../components/employee-list-link';

import detailsStyles from '../OrgUnitDetails.module.scss';

const getFilterStr = (ids: string[], type: PresetType): string | null => {
  if (ids.length === 0) return null;

  const idsStr = ids.map((id) => `'${id}'`).join(',');
  return `type == "${type}" && legacy_id in [${idsStr}]`;
};

type Props = {
  orgUnit: OrgUnitResult;
  type: PresetType;
};

const useTotalMembersData = ({
  enabled,
  orgUnit,
  type,
}: Props & { enabled: boolean }) => {
  const { companyId } = useAuthContext();
  const descendantsIds = useMemo(
    () =>
      orgUnit.descendants
        ?.map((desc) => getOrgUnitId(desc as OrgUnitResult, type))
        .concat(getOrgUnitId(orgUnit, type))
        .filter((id): id is string => id !== undefined) ?? [],
    [orgUnit],
  );
  const filterStr = getFilterStr(descendantsIds, type);
  const orgUnitsData = useListOrgUnits({
    variables: {
      companyId,
      filter: filterStr,
      includeDirectMemberCount: true,
    },
    queryOptions: { enabled: enabled && filterStr !== null },
  });

  const totalMembersCount = useMemo(() => {
    console.log('[]', orgUnitsData.data?.data?.orgUnits?.orgUnitsList);
    return (
      orgUnitsData.data?.data?.orgUnits?.orgUnitsList.reduce(
        (acc, curr) => acc + (curr.directMemberCount ?? 0),
        0,
      ) ?? 0
    );
  }, [orgUnitsData.data]);

  return { orgUnitsData, totalMembersCount, descendantsIds };
};

export const TotalMembers = ({ orgUnit, type }: Props) => {
  const { t } = useTranslation('org-units');
  const featureFlag = useFeatureFlag(FeatureFlags.SHOW_MEMBERS_LIST);
  const isEnabledAndReady = featureFlag.isReady && featureFlag.isOn;

  const totalMembersData = useTotalMembersData({
    enabled: isEnabledAndReady,
    orgUnit,
    type,
  });

  if (
    !isEnabledAndReady ||
    totalMembersData.orgUnitsData.isFetching ||
    totalMembersData.orgUnitsData.isError ||
    totalMembersData.totalMembersCount === 0
  )
    return null;

  const title: string = t('attributes.total-members');

  return (
    <PropertyListItem aria-label={title}>
      <PropertyListItemLabel className={detailsStyles.listRowDescription}>
        {title}
        <Tooltip
          content={
            type === 'department'
              ? t('tooltips.total-members_department', { name: orgUnit.name })
              : t('tooltips.total-members_team', { name: orgUnit.name })
          }
        >
          <Icon icon={icons.infoCircle} className={detailsStyles.infoCircle} />
        </Tooltip>
      </PropertyListItemLabel>
      <PropertyListItemValue.Custom
        className={detailsStyles.splittedCell}
        value={
          <>
            <span>{totalMembersData.totalMembersCount}</span>
            <EmployeeListLink
              ids={totalMembersData.descendantsIds}
              type={type}
              excludeInactive
            >
              {t('people-list-link')}
            </EmployeeListLink>
          </>
        }
      />
    </PropertyListItem>
  );
};

TotalMembers.displayName = 'PropertyListItem';
