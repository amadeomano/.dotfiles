import { Stack } from 'designSystem/component/layout';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';
import { Header } from '../components/Header/Header';

export const ManagePayGroups = () => (
  <Stack space="section-medium">
    <Header
      title="Payroll schedule"
      description="
      Manage payroll schedules for all your employees at once, or organize them into groups for ultimate control
    "
    />
    <h3></h3>
    <p></p>
    <EmptyState
      icon={icons.documentText}
      title="We can’t preview pay dates"
      description="You need to add schedule information first"
    />
  </Stack>
);
