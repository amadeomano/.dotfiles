import { type NextRouter, useRouter } from 'next/router';

const PAY_RUN_KEY = 'active-run';

const getActivePayRun = (router: NextRouter) => (): string | undefined => {
  return router.query[PAY_RUN_KEY];
};

export const usePayRunNavigator = () => {
  const router = useRouter();
};
