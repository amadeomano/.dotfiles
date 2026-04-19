import { useRouter } from 'next/router';

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

  const isEmployeeActive = !Number.isNaN(Number(router.query.slug?.at(2)));

  return {
    navigateToCreate,
    isInCreateRoute,
    navigateToContributionGroupsList,
    isSchemaActive,
    isInContributionGroupsListRoute,
  };
};
