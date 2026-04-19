import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import {
  ListItem,
  ListItemAvatar,
  ListItemText,
} from 'designSystem/component/list';
import { Stack } from 'designSystem/component/layout';

import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';

import { useOrgChartDataSourceContext } from '../../../../../contexts';

import cardStyles from '../../OrgUnitCard.module.scss';
import styles from './Leads.module.scss';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type LeadsProps = { orgUnit: OrgUnit; isUnmatched?: boolean };
export const Leads = ({ orgUnit, isUnmatched }: LeadsProps) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.org-unit-card.accessible-labels',
  });
  const dataSource = useOrgChartDataSourceContext();
  const leads = orgUnit.orgUnitLeadsList ?? [];

  const completeHierarchy = dataSource.completeHierarchyData.data;
  const leadsCount =
    completeHierarchy.source === 'Department' ||
    completeHierarchy.source === 'Team'
      ? completeHierarchy.leadsCount ?? 0
      : 0;

  const height = useMemo(
    () =>
      (leadsCount ? parseInt(cardStyles.leadsMargin) : 0) +
      parseInt(cardStyles.leadHeight) * leadsCount,
    [orgUnit, leadsCount],
  );

  if (!leadsCount) return null;

  const leadNames: string = leads
    .map((lead) => lead.person?.preferredName?.value)
    .join(', ');

  return (
    <section
      className={classnames(styles.leadsListContainer, {
        [cardStyles.unmatched]: isUnmatched,
      })}
      style={{ height }}
      aria-label={t('leads', {
        count: leads.length,
        leadNames: leads.length > 0 ? leadNames : t('leads_none'),
      })}
    >
      <Stack className={styles.leadsList} role="listbox">
        {leads.map((lead) => {
          const name = lead.person?.preferredName?.value ?? '';
          const positionTitle =
            lead.person?.currentPrimaryEmployment?.positionTitle?.value;

          return (
            <ListItem
              key={lead.personId.id}
              className={styles.leadItem}
              aria-label={`${name} (${positionTitle ?? ''})`}
            >
              <ListItemAvatar
                size="default"
                src={lead.person?.profilePicUrls?.paths?.small ?? undefined}
                name={name}
              />
              <ListItemText
                className={styles.labels}
                meta={positionTitle ?? undefined}
              >
                {name}
              </ListItemText>
            </ListItem>
          );
        })}
      </Stack>
    </section>
  );
};
