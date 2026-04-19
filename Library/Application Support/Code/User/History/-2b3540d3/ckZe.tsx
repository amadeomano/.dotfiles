import { Stack } from 'designSystem/component/layout';
import { usePayRunNavigator } from '../../../../hooks/navigators/usePayRunNavigator';
import {
  usePayrollRuns,
  getPayRunById,
} from '../../../../hooks/payroll-lifecycle/usePayrollRuns';
import { useEmployeeDetailsPanelNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { EmployeeGeneralInfo } from './components/EmployeeGeneralInfo/EmployeeGeneralInfo';
import { EmployeeTabBar } from './components/EmployeeTabs/EmployeeTabBar';

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
      <EmployeeTabBar />
      <h4>Gross Pay</h4>
    </Stack>
  );
};
