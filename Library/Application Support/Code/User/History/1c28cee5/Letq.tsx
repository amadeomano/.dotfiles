import { useMemo, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import classnames from 'classnames';

import { Facepile, type FacepileItem } from 'designSystem/component/facepile';
import { Tooltip } from 'designSystem/component/tooltip';

import {
  useOrgUnitMemberData,
  useOrgUnitFirstMemberIds,
  useOrgUnitMemberAvatars,
  type ListOrgUnitsQueryResult,
} from '@personio-web/employees-organizations-gofer';
import { TestIds } from '../../../../../utils/test-ids';

import { useTotalMembersCount } from './useTotalMembersCount';
import cardStyles from '../../OrgUnitCard.module.scss';
import styles from './Members.module.scss';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type MembersProps = { orgUnit: OrgUnit; isUnmatched?: boolean };

const MAX_VISIBLE_AVATARS = 2;

export const Members = ({ orgUnit, isUnmatched }: MembersProps) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.org-unit-card',
  });
  const { t: tAccessible } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.org-unit-card.accessible-labels',
  });

  const totalMembersCount = useTotalMembersCount(orgUnit);

  const twoMemberIds = useOrgUnitFirstMemberIds(orgUnit);
  const personIds = twoMemberIds.data?.map((mem) => mem.personId);
  const twoMemberAvatars = useOrgUnitMemberAvatars(personIds);

  const directMembersItems: FacepileItem[] = useMemo(() => {
    return (twoMemberAvatars.data ?? [])
      .slice(0, MAX_VISIBLE_AVATARS)
      .map((member) => ({
        id: member.id,
        // name: member.person?.preferredName?.value ?? undefined,
        src: member.profilePicUrls?.paths?.small ?? undefined,
      }));
  }, [twoMemberAvatars.data]);

  const directMembersCount: number = orgUnit.directMemberCount ?? 0;

  const hasMembers = useMemo(
    () => directMembersCount > 0 || (totalMembersCount ?? 0) > 0,
    [totalMembersCount],
  );

  const totalMembersIndicator: string | null = useMemo(() => {
    if (
      !totalMembersCount ||
      totalMembersCount < 1 ||
      totalMembersCount === directMembersCount
    )
      return null;
    return t('total-members', { count: totalMembersCount });
  }, [totalMembersCount, directMembersCount]);

  if (!hasMembers) return null;

  const tooltipKey =
    orgUnit.type === 'ORG_UNIT_TYPE_UNSPECIFIED'
      ? undefined
      : orgUnit.type === 'ORG_UNIT_TYPE_DEPARTMENT'
      ? 'tooltips.members_department'
      : 'tooltips.members_team';

  return (
    <Tooltip
      content={
        <Trans
          t={t}
          i18nKey={tooltipKey}
          values={{
            name: orgUnit.name,
            count: directMembersCount,
            total: totalMembersCount,
          }}
          components={{ br: <br /> }}
        />
      }
    >
      <section
        data-test-id={TestIds.OrgUnitCardMembers}
        className={classnames(styles.members, {
          [cardStyles.unmatched]: isUnmatched,
        })}
        aria-label={tAccessible('members', {
          direct: directMembersCount,
          total: totalMembersCount,
        })}
      >
        {directMembersItems.length ? (
          <Facepile
            totalItems={
              directMembersCount > MAX_VISIBLE_AVATARS
                ? 100 + MAX_VISIBLE_AVATARS // always display ellipsis
                : directMembersCount
            }
            items={directMembersItems}
          />
        ) : null}
        <span>
          {directMembersCount === 0
            ? t('members_zero')
            : t('members', { count: directMembersCount })}
          {totalMembersIndicator}
        </span>
      </section>
    </Tooltip>
  );
};
