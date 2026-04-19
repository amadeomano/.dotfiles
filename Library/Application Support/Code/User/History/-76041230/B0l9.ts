// TODO: this file could be removed from this app once the app is moved to NorthStar
// in favour of `@personio-web/payroll-util-navigation` package
import type { NextRouter } from 'next/router';

type Params<K extends string> = { [key in K]: string | undefined };

export const createUrl = (router: NextRouter, resetParams: boolean): URL =>
  resetParams
    ? new URL(window.location.pathname, window.location.origin)
    : new URL(router.asPath, window.location.origin);

export const commitNavigation = (router: NextRouter, url: URL): void => {
  // TODO: could improve if comparing each search param is needed, i.e. so that param order doesn't play a role
  if (`${url.pathname}${url.search}` === router.asPath) return;
  console.log('calling for %s -> %s', router.asPath, url.search);
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
