import { type NextRouter, useRouter } from 'next/router';

const PAY_RUN_KEY = 'active-run';

const getActivePayRun = (router: NextRouter) => (): string | undefined => {
  const activeRun = router.query[PAY_RUN_KEY];
  return Array.isArray(activeRun) ? activeRun[0] : activeRun;
};

const navigateToPayRun =
  (router: NextRouter) =>
  (run: string): void => {
    const activeRun = getActivePayRun(router)();
    if (activeRun === run) return;
    router.push({ query: { ...router.query, [PAY_RUN_KEY]: run } });
  };

export const usePayRunNavigator = () => {
  const router = useRouter();
};
