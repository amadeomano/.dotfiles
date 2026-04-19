import { useRouter } from 'next/router';

export const useContributionGroupNavigation = () => {
  const router = useRouter();

  const getActiveSchemeId = () => router.query.slug?.at(3);

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
    getActiveSchemeId,
    navigateToCreate,
    isInCreateRoute,
  };
};
