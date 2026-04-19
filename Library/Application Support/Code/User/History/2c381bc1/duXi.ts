import { type NextRouter, useRouter } from 'next/router';

const PAY_RUN_KEY = 'active-run';

const getActivePayRun = (router: NextRouter) => (): string | undefined => {};

export const usePayRunNavigator = () => {
  const router = useRouter();
};
