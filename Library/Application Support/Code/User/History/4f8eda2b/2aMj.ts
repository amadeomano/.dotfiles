import { useContext } from 'react';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { EmployeeDetailsPanelContext } from './EmployeeDetailsPanelContext';

export const useEmployeeDetailsPanelContext = () => {
  const context = useContext(EmployeeDetailsPanelContext);
  if (!context)
    throw new Error(
      'useEmployeeListNavigatorContext must be used within a EmployeeListNavigatorContextProvider',
    );
  return context;
};

export const useSyncEmployeeDetailsPanelList = (
  employees: PayrollRun['employeeResults'],
): void => {
  const { employeeIds, setEmployeeIds } = useEmployeeDetailsPanelContext();
  const newIds = employees.map((e) => e.employeeId);
  if (JSON.stringify(employeeIds) === JSON.stringify(newIds)) return;
  setEmployeeIds(newIds);
};
