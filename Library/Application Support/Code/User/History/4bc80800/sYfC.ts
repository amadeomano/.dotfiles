/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/payroll-util-navigation-types' {}

declare module 'payroll/util/payroll-util-navigation' {
  export * from '@personio-web/payroll-util-navigation-types';
}

declare module '@personio-web/payroll-util-navigation' {
  export * from '@personio-web/payroll-util-navigation-types';
}
