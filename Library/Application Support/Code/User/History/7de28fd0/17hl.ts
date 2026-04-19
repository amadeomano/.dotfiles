import { useRouter } from 'next/router';

// Format: /personal/:employeeId?/{pensions|etc}?/{allocate|etc}?
const EMPLOYEE_ID_INDEX = 1;
const EMPLOYEE_TAB_INDEX = 2;
const EMPLOYEE_TAB_ACTION_INDEX = 3;

export const usePayrollRunNavigation = () => {
  const router = useRouter();
  const routeSlugs = router.query.slug as string[];

  const navigateToEmployee = (employeeId: string) => {
    router.push({
      query: {
        ...router.query,
        slug: routeSlugs.slice(0, EMPLOYEE_ID_INDEX).concat(employeeId),
      },
    });
  };

  const navigateToListing = () => {
    router.push({
      query: {
        ...router.query,
        slug: routeSlugs.slice(0, EMPLOYEE_ID_INDEX),
      },
    });
  };

  const activeEmployeeId = routeSlugs.at(EMPLOYEE_ID_INDEX);

  return {
    navigateToEmployee,
    navigateToListing,
    activeEmployeeId,
  };
};
