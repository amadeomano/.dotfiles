import { useContext, useEffect } from 'react';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { EmployeeDetailsPanelContext } from './EmployeeDetailsPanelContext';

export const useEmployeeDetailsPanelContex = () => {
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
  const { employeeIds, setEmployeeIds } = useEmployeeListNavigatorContext();
  const newIds = employees.map((e) => e.employeeId);
  if (JSON.stringify(employeeIds) === JSON.stringify(newIds)) return;
  setEmployeeIds(newIds);
};

const ShowList = () => {
  const { employeeIds } = useEmployeeListNavigatorContext();
  return <div>{employeeIds.join(', ')}</div>;
};
