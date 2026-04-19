import { type NextRouter, useRouter } from 'next/router';
import { type EmployeeDetailsPanelContextData } from '../contexts/EmployeeDetailsPanelContext';
import { useEmployeeDetailsPanelContext } from '../contexts/useEmployeeDetailsPanelContext';

const EMPLOYEE_KEY = 'employee';

export const getHrefForEmployeeDetails =
  (router: NextRouter) =>
  (empId: number): string => {
    const { pathname, query } = router;
    const newQuery = { ...query, [EMPLOYEE_KEY]: empId.toString() };
    return `${pathname}?${new URLSearchParams(newQuery).toString()}`;
  };

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

    if (activeIdx < 0 || activeIdx > employeeIds.length) return;
    navigateToEmployeeDetails(router)(employeeIds[activeIdx + 1]);
  };

export const navigateToPreviousEmployee =
  (router: NextRouter, context: EmployeeDetailsPanelContextData) =>
  (): void => {
    const activeEmployeeId = getActiveEmployeeId(router)();
    if (!activeEmployeeId) return;

    const { employeeIds } = context;
    const activeIdx = employeeIds.indexOf(activeEmployeeId);

    if (activeIdx <= 0) return;
    navigateToEmployeeDetails(router)(employeeIds[activeIdx - 1]);
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
  const context = useEmployeeDetailsPanelContext();

  return {
    getActiveEmployeeId: getActiveEmployeeId(router),
    navigateToEmployeeDetails: navigateToEmployeeDetails(router),
    navigateToNextEmployee: navigateToNextEmployee(router, context),
    navigateToPreviousEmployee: navigateToPreviousEmployee(router, context),
    navigateOutOfEmployeeDetails: navigateOutOfEmployeeDetails(router),
  };
};
