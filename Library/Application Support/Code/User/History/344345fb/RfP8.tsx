import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Facepile, type FacepileItem } from 'designSystem/component/facepile';

import {
  useOrgUnitMemberData,
  type ListOrgUnitsQueryResult,
} from '@personio-web/employees-organizations-gofer';
import { toTranslate } from '../../../../toTranslate';
import { TestIds } from '../../../../utils/test-ids';

import { useTotalMembersCount } from './useTotalMembersCount';
import styles from './Members.module.scss';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type MembersProps = { orgUnit: OrgUnit };

const MAX_VISIBLE_AVATARS = 2;

export const Members = ({ orgUnit }: MembersProps) => {
  const { t } = useTranslation('employees-organizations');

  const directMemberData = useOrgUnitMemberData(orgUnit);
  const totalMembersCount = useTotalMembersCount(orgUnit);
  if (orgUnit.id === '01JSH1JS1MDG0WPJXXYWKMP4G9')
    console.log('[] total', totalMembersCount);

  const directMembersItems: FacepileItem[] = useMemo(() => {
    return (directMemberData.data ?? [])
      .slice(0, MAX_VISIBLE_AVATARS)
      .map((member) => ({
        id: member.personId,
        name: member.person?.preferredName?.value ?? undefined,
        src: member.person?.profilePicUrls?.paths?.small ?? undefined,
      }));
  }, [directMemberData.data]);

  const directMembersCount: number = orgUnit.directMemberCount ?? 0;

  const hasMembers = useMemo(
    () => directMembersCount > 0 || (totalMembersCount ?? 0) > 0,
    [totalMembersCount],
  );

  const totalMembersIndicator = useMemo(() => {
    if (
      !totalMembersCount ||
      totalMembersCount <= 1 ||
      totalMembersCount === directMembersCount
    )
      return null;
    return t('', {
      defaultValue: toTranslate.orgUnitCard.totalMembers,
      count: totalMembersCount,
    });
  }, [totalMembersCount]);

  if (!hasMembers) return null;

  return (
    <section
      data-test-id={TestIds.OrgUnitCardMembers}
      className={styles.members}
    >
      {directMembersItems.length ? (
        <Facepile
          totalItems={
            directMembersCount > MAX_VISIBLE_AVATARS
              ? 100 + MAX_VISIBLE_AVATARS
              : directMembersCount
          }
          items={directMembersItems}
        />
      ) : null}
      <span>
        {/* @ts-expect-error the key is to be defined in Phrase */}
        {t('', {
          defaultValue: toTranslate.orgUnitCard.members,
          defaultValue_plural: toTranslate.orgUnitCard.members_plural,
          count: orgUnit.directMemberCount,
        })}
        {totalMembersIndicator}
      </span>
    </section>
  );
};
