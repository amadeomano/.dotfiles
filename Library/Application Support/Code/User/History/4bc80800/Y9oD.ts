import type { NextRouter } from 'next/router';
/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/payroll-util-navigation-types' {
  type Params<K extends string> = { [key in K]: string | undefined };
  const createUrl: (router: NextRouter, resetParams: boolean) => URL;
  const commitNavigation: (router: NextRouter, url: URL) => void;
  const createParamHandlers: <K extends string>(
    keys: readonly K[],
  ) => {
    getParams: (query: NextRouter['query']) => Params<K>;
    setParam: (url: URL, param: K, value: string) => void;
    deleteParam: (url: URL, param: K) => void;
  };
  export { createUrl };
}

declare module 'payroll/util/payroll-util-navigation' {
  export * from '@personio-web/payroll-util-navigation-types';
}

declare module '@personio-web/payroll-util-navigation' {
  export * from '@personio-web/payroll-util-navigation-types';
}
