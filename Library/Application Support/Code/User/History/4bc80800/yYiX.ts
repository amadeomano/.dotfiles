/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/payroll-util-navigation-types' {
  import type { UseNavigatorReturnedType } from '@personio-web/payroll-hook-use-navigator';

  export type PayrollIntegrationSettingsParams =
    typeof import('./types').payrollIntegrationSettingsParams;

  export type PayrollIntegration = 'xero' | 'a3';

  export type UsePayrollIntegrationSettingsNavigator = (
    integration: PayrollIntegration,
  ) => UseNavigatorReturnedType<PayrollIntegrationSettingsParams>;
  const usePayrollIntegrationSettingsNavigator: UsePayrollIntegrationSettingsNavigator;

  export type PayrollHubParams = typeof import('./types').payrollHubParams;
  export type XeroPayrollPeopleParams =
    typeof import('./types').xeroPayrollPeopleParams;
  export type A3PayrollPeopleParams =
    typeof import('./types').a3PayrollPeopleParams;

  export type UseXeroPayrollHubNavigator =
    () => UseNavigatorReturnedType<PayrollHubParams>;
  const useXeroPayrollHubNavigator: UseXeroPayrollHubNavigator;

  export type UseXeroPayrollPeopleNavigator =
    () => UseNavigatorReturnedType<XeroPayrollPeopleParams>;
  export const useXeroPayrollPeopleNavigator: UseXeroPayrollPeopleNavigator;

  export type UseA3PayrollPeopleNavigator =
    () => UseNavigatorReturnedType<A3PayrollPeopleParams>;
  export const useA3PayrollPeopleNavigator: UseA3PayrollPeopleNavigator;

  export { usePayrollIntegrationSettingsNavigator, useXeroPayrollHubNavigator };
}

declare module 'payroll/hook/use-payroll-integration-navigator' {
  export * from '@personio-web/payroll-hook-use-payroll-integration-navigator-types';
}

declare module '@personio-web/payroll-hook-use-payroll-integration-navigator' {
  export * from '@personio-web/payroll-hook-use-payroll-integration-navigator-types';
}

declare module 'globalExperience/registerMocks';
