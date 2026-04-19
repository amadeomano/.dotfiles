import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';

export const ManagePayGroups = () => (
  <>
    <h3>Payroll schedule</h3>
    <p>
      Manage payroll schedules for all your employees at once, or organize them
      into groups for ultimate control
    </p>
    <EmptyState
      icon={icons.documentText}
      title="We can’t preview pay dates"
      description="You need to add schedule information first"
    />
  </>
);
