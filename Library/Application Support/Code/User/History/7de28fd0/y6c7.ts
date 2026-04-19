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
  const isSchemaActive = (id: string) => router.query.slug?.includes(id);
  const isInContributionGroupsListRoute = router.query.slug?.includes(
    'contribution-groups',
  );

  return {
    navigateToCreate,
    isInCreateRoute,
    navigateToContributionGroupsList,
    isSchemaActive,
    isInContributionGroupsListRoute,
  };
};
