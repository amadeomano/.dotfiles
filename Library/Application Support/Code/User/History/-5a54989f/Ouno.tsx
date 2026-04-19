import { useMemo } from 'react';
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

type LeadsProps = { orgUnit: OrgUnit };
export const Leads = ({ orgUnit }: LeadsProps) => {
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

  return (
    <div className={styles.leadsListContainer} style={{ height }}>
      <Stack className={styles.leadsList} role="listbox">
        {leads.map((lead) => (
          <ListItem
            key={lead.personId.id}
            className={styles.leadItem}
            aria-label={lead.person?.preferredName?.value}
          >
            <ListItemAvatar
              size="default"
              src={lead.person?.profilePicUrls?.paths?.small ?? undefined}
              name={lead.person?.preferredName?.value ?? ''}
            />
            <ListItemText
              className={styles.labels}
              meta={
                lead.person?.currentPrimaryEmployment?.positionTitle?.value ??
                undefined
              }
            >
              {lead.person?.preferredName?.value ?? ''}
            </ListItemText>
          </ListItem>
        ))}
      </Stack>
    </div>
  );
};
