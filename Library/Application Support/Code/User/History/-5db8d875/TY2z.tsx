import { useTranslation } from 'react-i18next';

import { icons, Icon } from 'designSystem/component/icon';
import { Tooltip } from 'designSystem/component/tooltip';

import { type PresetType } from '@personio-web/employees-organizations-util-org-units';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { FeatureFlags } from '../../featureFlags';
import { type OrgUnitResult } from '../../../types';
import { EmployeeListLink } from '../../../components/employee-list-link';
import { getOrgUnitId } from '../../../utils/getOrgUnitId';
import { toTranslate } from '../../toTranslate';
import { LegacyLink } from './LegacyLink';
import styles from './PeopleListLink.module.scss';
import drawerStyles from '../../OrgUnitDetails.module.scss';

type Props = {
  orgUnit: OrgUnitResult;
  type: PresetType;
};
export const DirectPeopleListLink = ({ orgUnit, type }: Props) => {
  const { t } = useTranslation('org-units');
  const featureFlag = useFeatureFlag(FeatureFlags.SHOW_MEMBERS_LIST);
  const isEnabledAndReady = featureFlag.isOn && featureFlag.isReady;
  console.log('[] isEnabledAndReady', isEnabledAndReady);

  if (orgUnit.directMemberCount === 0) return null;

  if (!isEnabledAndReady) return <LegacyLink orgUnit={orgUnit} type={type} />;

  console.log('[] Tooltip', Tooltip);

  return (
    <div className={styles.peopleListLinkRow}>
      <h5 role="heading" aria-level={5}>
        {t('', {
          defaultValue: toTranslate.peopleListLink.directMembersTitle,
          count: orgUnit.directMemberCount || 0,
        })}
        <Tooltip content="boo">
          <Icon icon={icons.infoCircle} className={drawerStyles.infoCircle} />
        </Tooltip>
      </h5>
      <EmployeeListLink
        ids={[getOrgUnitId(orgUnit, type) ?? '']}
        type={type}
        excludeInactive
      >
        {t('', { defaultValue: toTranslate.peopleListLink.link })}
      </EmployeeListLink>
    </div>
  );
};
