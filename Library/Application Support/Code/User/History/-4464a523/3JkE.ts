import { NextRouter } from 'next/router';

type Params<K extends string> = { [key in K]: string | undefined };

// Keeps the last url update to avoid NextRouters stale issue
// https://github.com/vercel/next.js/issues/29240#issuecomment-923428999
let lastPath: string | undefined = undefined;
export const createUrl = (router: NextRouter, resetParams: boolean): URL =>
  resetParams
    ? new URL(window.location.pathname, window.location.origin)
    : new URL(lastPath ?? router.asPath, window.location.origin);

let calls: string[] = [];
export const commitNavigation = (router: NextRouter, url: URL): void => {
  if (`${url.pathname}${url.search}` === lastPath) return;
  calls = [...calls, url.search];
  console.groupCollapsed(
    `${lastPath?.replace(url.pathname, '')} -> ${url.search}`,
  );
  console.count('committed');
  console.log(calls);
  console.trace();
  console.groupEnd();
  lastPath = `${url.pathname}${url.search}`;
  router.replace(url);
};

export const createParamHandlers = <K extends string>(keys: readonly K[]) => ({
  getParams: (query: NextRouter['query']): Params<K> => {
    const result: Partial<Params<K>> = {};
    keys.forEach((key) => {
      // CAUTION: calling toString() flattens string[] query params
      // But we don't have any need for array query params yet
      const value = query[key];
      result[key] = value ? value.toString() : undefined;
    });
    return result as Params<K>;
  },
  setParam: (url: URL, param: K, value: string): void => {
    url.searchParams.set(param, value);
  },
  deleteParam: (url: URL, param: K): void => {
    url.searchParams.delete(param);
  },
});
