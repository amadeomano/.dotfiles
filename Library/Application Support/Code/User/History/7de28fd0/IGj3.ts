import { useRouter } from 'next/router';

// Format: /personal/:employeeId?/{pensions|etc}?/{allocate|etc}?

export const usePayrollRunNavigation = () => {
  const router = useRouter();

  const navigateToEmployee = (employeeId: string) => {
    router.push({
      query: {
        ...router.query,
        slug: (router.query.slug as string[]).slice(0, 1).concat(employeeId),
      },
    });
  };

  const navigateToListing = () => {
    router.push({
      query: {
        ...router.query,
        slug: (router.query.slug as string[]).slice(0, 1),
      },
    });
  };

  const activeEmployeeId = router.query.slug?.at(2);

  return {
    navigateToEmployee,
    activeEmployeeId,
  };
};
