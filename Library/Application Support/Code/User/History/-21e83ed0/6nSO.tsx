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

  const navigateToContributionGroupsList = () => {
    router.push({
      query: {
        ...router.query,
        slug: [...(router.query.slug as string[]), 'contribution-groups'],
      },
    });
  };

  const isInCreateRoute = router.query.slug?.includes('create');

  return { navigateToCreate, isInCreateRoute };
};
