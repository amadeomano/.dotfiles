import { Tabs } from 'designSystem/component/tabs';
import { usePayRunNavigator } from '../../../../hooks/navigators/usePayRunNavigator';
import {
  usePayrollRuns,
  getPayRunById,
} from '../../../../hooks/payroll-lifecycle/usePayrollRuns';
import { useEmployeeDetailsPanelNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { EmployeeGeneralInfo } from './components/EmployeeGeneralInfo/EmployeeGeneralInfo';

export const EmployeeDetailsPanelContent = () => {
  const { payrollRuns } = usePayrollRuns();
  const { getActivePayRun } = usePayRunNavigator();
  const { getActiveEmployeeId } = useEmployeeDetailsPanelNavigator();

  const activeRunId = getActivePayRun();
  const activeRun = getPayRunById(payrollRuns?.data ?? [], activeRunId);
  const employeeResult = activeRun?.employeeResults.find(
    (emp) => emp.employeeId === getActiveEmployeeId(),
  );

  return (
    <>
      <EmployeeGeneralInfo employee={employeeResult?.employee} />
      <div>{getActiveEmployeeId()}</div>
      <Tabs defaultValue="1" {...props}>
        <Tabs.List>
          <Tabs.Trigger value="1">One</Tabs.Trigger>
          <Tabs.Trigger value="2">Two</Tabs.Trigger>
          <Tabs.Trigger value="3">Three</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="1">Tab one content</Tabs.Content>
        <Tabs.Content value="2">Tab two content</Tabs.Content>
        <Tabs.Content value="3">Tab three content</Tabs.Content>
      </Tabs>
    </>
  );
};
