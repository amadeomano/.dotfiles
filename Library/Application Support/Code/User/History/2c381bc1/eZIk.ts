import { type NextRouter, useRouter } from 'next/router';

const PAY_RUN_KEY = 'active-run';

export const getActivePayRun =
  (router: NextRouter) => (): string | undefined => {
    const activeRun = router.query[PAY_RUN_KEY];
    return Array.isArray(activeRun) ? activeRun[0] : activeRun;
  };

export const navigateToPayRun =
  (router: NextRouter) =>
  (run: string): void => {
    const activeRun = getActivePayRun(router)();
    if (activeRun === run) return;
    router.push({ query: { ...router.query, [PAY_RUN_KEY]: run } });
  };

export const getQueryWithoutPayRun =
  (router: NextRouter) => (): NextRouter['query'] => {
    const { [PAY_RUN_KEY]: removedRun, ...restQuery } = router.query;
    return restQuery;
  };
export const navigateOutOfPayRun = (router: NextRouter) => (): void => {
  const activeRun = getActivePayRun(router)();
  if (!activeRun) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [PAY_RUN_KEY]: removedRun, ...restQuery } = router.query;
  router.push({ query: restQuery });
};

export const usePayRunNavigator = () => {
  const router = useRouter();
  return {
    getActivePayRun: getActivePayRun(router),
    navigateToPayRun: navigateToPayRun(router),
    navigateOutOfPayRun: navigateOutOfPayRun(router),
  };
};
