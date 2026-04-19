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

  const height = useMemo(() => {
    const completeHierarchy = dataSource.completeHierarchyData.data;
    const leadsCount =
      completeHierarchy.source === 'Department' ||
      completeHierarchy.source === 'Team'
        ? completeHierarchy.leadsCount ?? 0
        : 0;

    return (
      parseInt(cardStyles.leadsMargin) +
      parseInt(cardStyles.leadHeight) * leadsCount
    );
  }, []);

  return (
    <div className={styles.leadsListContainer} style={{ height }}>
      <Stack className={styles.leadsList}>
        {leads.map((lead) => (
          <ListItem key={lead.personId.id} className={styles.leadItem}>
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
