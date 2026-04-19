import { useRouter } from 'next/router';

// Format: /personal/:employeeId?/{pensions|etc}?/{allocate|etc}?
const EMPLOYEE_ID_INDEX = 1;
const EMPLOYEE_TAB_INDEX = 2;
const EMPLOYEE_TAB_ACTION_INDEX = 3;

export const usePayrollRunNavigation = () => {
  const router = useRouter();
  const routeSlugs = router.query.slug as string[];
  const getUpdatedSlugs = (newSlugs: string[]) => {
    return {
      query: {
        ...router.query,
        slug: newSlugs,
      },
    };
  };

  const navigateToEmployee = (employeeId: string) => {
    router.push(
      getUpdatedSlugs(
        routeSlugs.slice(0, EMPLOYEE_ID_INDEX).concat([employeeId, 'pensions']),
      ),
    );
  };

  const navigateToListing = () => {
    router.push(getUpdatedSlugs(routeSlugs.slice(0, EMPLOYEE_ID_INDEX)));
  };

  const navigateToAllocate = () => {
    router.push(routeSlugs.slice(0, EMPLOYEE_TAB_INDEX).concat('allocate'));
  };

  const activeEmployeeId = routeSlugs.at(EMPLOYEE_ID_INDEX);

  return {
    navigateToEmployee,
    navigateToListing,
    activeEmployeeId,
  };
};
