import { type NextRouter, useRouter } from 'next/router';

const LEGAL_ENTITY_KEY = 'le';

export const getActiveLegalEntity =
  (router: NextRouter) => (): string | undefined => {
    const activeLE = router.query[LEGAL_ENTITY_KEY];
    return Array.isArray(activeLE) ? activeLE[0] : activeLE;
  };

export const navigateToLegalEntity =
  (router: NextRouter) =>
  (legalEntity: string): void => {
    const activeLE = getActiveLegalEntity(router)();
    if (activeLE === legalEntity) return;
    router.push({
      query: { ...router.query, [LEGAL_ENTITY_KEY]: legalEntity },
    });
  };

export const usePayRunNavigator = () => {
  const router = useRouter();
  return {
    getActivePayRun: getActiveLegalEntity(router),
    navigateToPayRun: navigateToLegalEntity(router),
  };
};
