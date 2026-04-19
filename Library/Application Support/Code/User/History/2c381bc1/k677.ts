import { type NextRouter, useRouter } from 'next/router';

const getActivePayRun = (router: NextRouter) => (): string | undefined => {};

export const usePayRunNavigator = () => {
  const router = useRouter();
};
