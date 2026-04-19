import { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import classnames from 'classnames';

import { Icon, icons } from 'designSystem/component/icon';
import { Tooltip } from 'designSystem/component/tooltip';

import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';

import { NodeMap } from '../../../../../Nodes/constants';
import { TestIds } from '../../../../../utils/test-ids';
import { toTranslate } from '../../../../../toTranslate';
import styles from '../../OrgUnitCard.module.scss';

type OrgUnitType = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number]['type'];

type SpanOfControlProps = { node: any; type: OrgUnitType };
export const SpanOfControl = ({ node, type }: SpanOfControlProps) => {
  const { t } = useTranslation('employees-organizations');

  const directSubordinates = useMemo(
    () =>
      node?.children?.filter(
        (child) => child.data.type !== NodeMap.UnmatchedOrgUnit,
      ).length ?? 0,
    [node],
  );
  const totalSubordinates = useMemo(
    () =>
      node?.descendants.filter(
        (descendant) =>
          descendant.id !== node.id &&
          descendant.data.type !== NodeMap.UnmatchedOrgUnit,
      ).length ?? 0,
    [node],
  );

  const hasSpanOfControl = useMemo(
    () => directSubordinates > 0 || totalSubordinates > 0,
    [node],
  );

  if (type === 'ORG_UNIT_TYPE_UNSPECIFIED') return;

  return (
    <Tooltip
      content={
        <Trans
          t={t}
          values={{
            count: directSubordinates,
            total: totalSubordinates,
          }}
          components={{ br: <br /> }}
          defaults={
            type === 'ORG_UNIT_TYPE_DEPARTMENT'
              ? toTranslate.orgUnitCard.tooltips.subordinatesDepartment
              : toTranslate.orgUnitCard.tooltips.subordinatesTeam
          }
        />
      }
    >
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
    </Tooltip>
  );
};
