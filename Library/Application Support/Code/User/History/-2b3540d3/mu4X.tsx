import { payrollRunEmployeeFullname } from '../../../../utils/payrollRun';
import { usePayRunNavigator } from '../../../../hooks/navigators/usePayRunNavigator';
import {
  usePayrollRuns,
  getPayRunById,
} from '../../../../hooks/payroll-lifecycle/usePayrollRuns';
import { useEmployeeDetailsPanelNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { EmployeeGeneralInfo } from './EmployeeGeneralInfo';

export const EmployeeDetailsPanelContent = () => {
  const { payrollRuns } = usePayrollRuns();
  const { getActivePayRun } = usePayRunNavigator();
  const { getActiveEmployeeId } = useEmployeeDetailsPanelNavigator();

  const activeRunId = getActivePayRun();
  const activeRun = getPayRunById(payrollRuns?.data ?? [], activeRunId);
  const employee = activeRun?.employeeResults.find(
    (emp) => emp.employeeId === getActiveEmployeeId(),
  );

  return (
    <>
      <EmployeeGeneralInfo employee={employee?.employee} />
      <div>{getActiveEmployeeId()}</div>
    </>
  );
};
