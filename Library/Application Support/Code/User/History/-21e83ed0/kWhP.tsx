import { useRouter } from 'next/router';

export const usePensionSchemeNavigation = () => {
  const router = useRouter();

  const navigateToCreate = () => {
    router.push({
      query: {
        ...router.query,
        slug: [...(router.query.slug as string[]), 'create'],
      },
    });
  };

  const navigateToContributionGroupsList = (id: string) => {
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

  const isInCreateRoute = router.query.slug?.includes('create');

  const isSchemaActive = (id: string) => {
    console.log(router.query.slug);
    return router.query.slug?.includes(`${id}/contribution-groups`);
  };

  return {
    navigateToCreate,
    isInCreateRoute,
    navigateToContributionGroupsList,
    isSchemaActive,
  };
};
