import { useRouter } from 'next/router';

export const useContributionGroupNavigation = () => {
  const router = useRouter();

  const navigateToCreate = () => {
    router.push({
      query: {
        ...router.query,
        slug: [...(router.query.slug as string[]).slice(0, 3), 'create'],
      },
    });
  };

  const isInCreateRoute = router.query.slug?.includes('create');

  return {
    navigateToCreate,
    isInCreateRoute,
  };
};
