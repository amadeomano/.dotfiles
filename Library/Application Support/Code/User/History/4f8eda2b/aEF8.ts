import { useContext } from 'react';
import { EmployeeDetailsPanelContext } from './EmployeeDetailsPanelContext';

export const useEmployeeDetailsPanelContex = () => {
  const context = useContext(EmployeeDetailsPanelContext);
  if (!context)
    throw new Error(
      'useEmployeeListNavigatorContext must be used within a EmployeeListNavigatorContextProvider',
    );
  return context;
};

export const useSyncEmployeeListNavigatorList = (
  employees: PayrollRun['employeeResults'],
): void => {
  const { employeeIds, setEmployeeIds } = useEmployeeListNavigatorContext();
  useEffect(() => {
    const newIds = employees.map((e) => e.employeeId);
    if (JSON.stringify(employeeIds) === JSON.stringify(newIds)) return;
    setEmployeeIds(newIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);
};

const ShowList = () => {
  const { employeeIds } = useEmployeeListNavigatorContext();
  return <div>{employeeIds.join(', ')}</div>;
};
