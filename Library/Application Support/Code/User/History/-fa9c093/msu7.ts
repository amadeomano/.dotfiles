import { type NextRouter, useRouter } from 'next/router';
import { type EmployeeDetailsPanelContextData } from '../contexts/EmployeeDetailsPanelContext';
import { useEmployeeDetailsPanelContext } from '../contexts/useEmployeeDetailsPanelContext';

const EMPLOYEE_KEY = 'employee';
type StepperAction = (() => void) | undefined;

export const getHrefForEmployeeDetails = (
  router: NextRouter,
  empId: number,
): string => {
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

export const navigateOutOfEmployeeDetails =
  (router: NextRouter) => (): void => {
    const employeeId = getActiveEmployeeId(router)();
    if (!employeeId) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [EMPLOYEE_KEY]: removedEmpId, ...restQuery } = router.query;
    router.push({ query: restQuery });
  };

export const nextEmployeeNavigator =
  (router: NextRouter, context: EmployeeDetailsPanelContextData) =>
  (): StepperAction => {
    const activeEmployeeId = getActiveEmployeeId(router)();
    if (!activeEmployeeId) return;

    const { employeeIds } = context;
    const activeIdx = employeeIds.indexOf(activeEmployeeId);

    if (activeIdx < 0 || activeIdx >= employeeIds.length - 1) return;

    return () => navigateToEmployeeDetails(router)(employeeIds[activeIdx + 1]);
  };

export const previousEmployeeNavigator =
  (router: NextRouter, context: EmployeeDetailsPanelContextData) =>
  (): StepperAction => {
    const activeEmployeeId = getActiveEmployeeId(router)();
    if (!activeEmployeeId) return;

    const { employeeIds } = context;
    const activeIdx = employeeIds.indexOf(activeEmployeeId);

    if (activeIdx <= 0) return;
    return () => navigateToEmployeeDetails(router)(employeeIds[activeIdx - 1]);
  };

export const useEmployeeDetailsPanelNavigator = () => {
  const router = useRouter();

  return {
    getActiveEmployeeId: getActiveEmployeeId(router),
    navigateToEmployeeDetails: navigateToEmployeeDetails(router),
    navigateOutOfEmployeeDetails: navigateOutOfEmployeeDetails(router),
  };
};

export const useEmployeeDetailsPanelStepperNavigator = () => {
  const router = useRouter();
  const context = useEmployeeDetailsPanelContext();

  return {
    nextNavigator: nextEmployeeNavigator(router, context),
    prevNavigator: previousEmployeeNavigator(router, context),
  };
};
