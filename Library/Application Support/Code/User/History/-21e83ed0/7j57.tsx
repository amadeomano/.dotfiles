import { useRouter } from 'next/router';

export const useCreatePensionSchemeNavigation = () => {
  const router = useRouter();

  const navigateToCreate = () => {
    router.push({
      query: {
        ...router.query,
        slug: [...(router.query.slug as string[]), 'create'],
      },
    });
  };

  const isInCreateRoute = router.query.slug?.includes('create');

  return { navigateToCreate, isInCreateRoute };
};
