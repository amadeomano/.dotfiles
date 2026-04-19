import { Stack } from 'designSystem/component/layout';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';
import { Header } from '../components/Header/Header';
import { Button } from 'designSystem/component/button';
import styles from './ManagePayGroups.module.scss';

export const ManagePayGroups = () => (
  <Stack space="section-medium">
    <Header title="Payroll schedule">
      Manage payroll schedules for all your employees at once, or organize them
      into groups for ultimate control
    </Header>
    <Button icon={icons.plus} className={styles.addGroupButton} disabled>
      Add group
    </Button>
    <article className={styles.emptyStateWrapper}>
      <EmptyState
        icon={icons.documentText}
        title="We can’t preview pay dates"
        description="You need to add schedule information first"
      />
    </article>
  </Stack>
);
