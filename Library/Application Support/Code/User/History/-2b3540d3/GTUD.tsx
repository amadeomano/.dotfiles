import { Stack } from 'designSystem/component/layout';
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
    <Stack space="section-medium">
      <EmployeeGeneralInfo employee={employeeResult?.employee} />
      <Tabs defaultValue="1">
        <Tabs.List>
          <Tabs.Trigger value="compensation">Compensation</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
      <h4>Gross Pay</h4>
    </Stack>
  );
};
