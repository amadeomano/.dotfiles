import { useMemo } from 'react';
import classnames from 'classnames';

import { Icon, icons } from 'designSystem/component/icon';

import { NodeMap } from '../../../../../Nodes/constants';
import { TestIds } from '../../../../../utils/test-ids';
import styles from '../OrgUnitCard.module.scss';

type SpanOfControlProps = { node: any };
export const SpanOfControl = ({ node }: SpanOfControlProps) => {
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
