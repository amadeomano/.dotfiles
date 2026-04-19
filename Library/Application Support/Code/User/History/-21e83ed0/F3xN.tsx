import { useRouter } from 'next/router';

export const useOpenCreatePensionScheme = () => {
  const router = useRouter();

  const actionHandler = () => {
    router.push({
      query: {
        ...router.query,
        slug: [...(router.query.slug as string[]), 'create'],
      },
    });
  };

  return { actionHandler };
};
