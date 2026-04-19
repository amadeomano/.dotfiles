import { type NextRouter, useRouter } from 'next/router';
import { type EmployeeDetailsPanelContextData } from '../contexts/EmployeeDetailsPanelContext';

const EMPLOYEE_KEY = 'employee';

export const getActiveEmployeeId =
  (router: NextRouter) => (): number | undefined => {
    const activeEmployee = router.query[EMPLOYEE_KEY];
    return Array.isArray(activeEmployee)
      ? Number(activeEmployee[0])
      : Number(activeEmployee);
  };

export const navigateToEmployeeDetails =
  (router: NextRouter) =>
  (empId: number): void => {
    const activeEmployeeId = getActiveEmployeeId(router)();
    if (activeEmployeeId === empId) return;
    router.push({ query: { ...router.query, [EMPLOYEE_KEY]: empId } });
  };

export const navigateToNextEmployee =
  (router: NextRouter, context: EmployeeDetailsPanelContextData) =>
  (): void => {
    const activeEmployeeId = getActiveEmployeeId(router)();
    if (!activeEmployeeId) return;

    const { employeeIds } = context;
    const activeIdx = employeeIds.indexOf(activeEmployeeId);
    // const prevIdx = activeIdx > 0 ? activeIdx - 1 : null;
    const nextIdx =
      activeIdx >= 0 && activeIdx < employeeIds.length - 1
        ? activeIdx + 1
        : null;

    if (nextIdx === null) return;
    navigateToEmployeeDetails(router)(employeeIds[nextIdx]);
  };

export const navigateOutOfEmployeeDetails =
  (router: NextRouter) => (): void => {
    const employeeId = getActiveEmployeeId(router)();
    if (!employeeId) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [EMPLOYEE_KEY]: removedEmpId, ...restQuery } = router.query;
    router.push({ query: restQuery });
  };

export const useEmployeeDetailsPanelNavigator = () => {
  const router = useRouter();
  return {
    getActiveEmployeeId: getActiveEmployeeId(router),
    navigateToEmployeeDetails: navigateToEmployeeDetails(router),
    navigateOutOfEmployeeDetails: navigateOutOfEmployeeDetails(router),
  };
};
