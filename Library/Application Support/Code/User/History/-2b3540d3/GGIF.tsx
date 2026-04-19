import { payrollRunEmployeeFullname } from '../../../../utils/payrollRun';
import { usePayRunNavigator } from '../../../../hooks/navigators/usePayRunNavigator';
import {
  usePayrollRuns,
  getPayRunById,
} from '../../../../hooks/payroll-lifecycle/usePayrollRuns';
import { useEmployeeDetailsPanelNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';

export const EmployeeDetailsPanelContent = () => {
  const { payrollRuns } = usePayrollRuns();
  const { getActivePayRun } = usePayRunNavigator();
  const { getActiveEmployeeId } = useEmployeeDetailsPanelNavigator();

  const activeRunId = getActivePayRun();
  if (!activeRunId) return;

  const activeRun = getPayRunById(payrollRuns?.data ?? [], activeRunId);
  if (!activeRun) return;

  const employee = activeRun.employeeResults.find(
    (emp) => emp.employeeId === getActiveEmployeeId(),
  );

  return (
    <>
      <h1>{payrollRunEmployeeFullname(employee)}</h1>
      <div>{getActiveEmployeeId()}</div>
    </>
  );
};
