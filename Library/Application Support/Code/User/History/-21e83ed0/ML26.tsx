import { useRouter } from 'next/router';

export const usePensionSchemeNavigation = () => {
  const router = useRouter();

  const navigateToCreate = () => {
    router.push({
      query: {
        ...router.query,
        slug: [...(router.query.slug as string[]).slice(0, 2), 'create'],
      },
    });
  };

  const navigateToContributionGroupsList = (id: string) => {
    (router.query.slug as string[])
      .slice(0, 2)
      .concat([id, 'contribution-groups']);
    router.push({
      query: {
        ...router.query,
        slug: [
          ...(router.query.slug as string[]).slice(0, 2),
          id,
          'contribution-groups',
        ],
      },
    });
  };

  const isInCreateRoute = router.query.slug?.at(2) === 'create';
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
