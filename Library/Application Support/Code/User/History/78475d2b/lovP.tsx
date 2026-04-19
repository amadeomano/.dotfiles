import classnames from 'classnames';

import { Icon, icons } from 'designSystem/component/icon';

import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';

import styles from '../OrgUnitCard.module.scss';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type SpanOfControlProps = { orgUnit: OrgUnit };
export const SpanOfControl = ({ orgUnit }: SpanOfControlProps) => {
  return (
    <p
      className={classnames(styles.spanOfControl, {
        [styles.noSubCards]: !hasSpanOfControl,
      })}
      data-test-id={TestIds.SpanOfControl}
      aria-label={t('', {
        defaultValue: toTranslate.orgUnitCard.accessibleLabels.subordinates,
        direct: directSubordinates,
        total: totalSubordinates,
      })}
    >
      <Icon icon={icons.orgChart} />
      {hasSpanOfControl && directSubordinates}
      {totalSubordinates > 0 && ` (${totalSubordinates})`}
    </p>
  );
};
