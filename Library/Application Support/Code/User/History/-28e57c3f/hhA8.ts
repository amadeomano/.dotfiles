declare module '@personio-web/payroll-data-payroll-integration-oauth-types' {
  import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
  export type Payroll_Data_PayrollIntegrationOauthUrl_FedProps =
    import('@personio-web/federated-module/src/types').FederatedModuleInternalProps & {
      remote: 'payroll';
      module: './data/payroll-integration-oauth';
    };

  /* DO NOT DELETE - Auto generated exports - Start */
  /* DO NOT DELETE - Auto generated exports - End */

  export type ApiError = import('./types').ApiError;
  export type PayrollIntegrationErrorResponse =
    import('./types').PayrollIntegrationErrorResponse;

  export type PayrollIntegrationOAuthDetails = {
    first_name: string;
    last_name: string;
    email: string;
    connection_id: string;
    connection_create_date: string;
    tenant_name: string;
    tenant_id: string;
  };

  export type PayrollIntegrationOAuthDetailsResponse = {
    data: PayrollIntegrationOAuthDetails;
  };

  export type UsePayrollIntegrationOAuthDetails = (
    integration: PayrollIntegration,
    legalEntityId: string,
  ) => import('react-query').UseQueryResult<
    PayrollIntegrationOAuthDetails,
    PayrollIntegrationErrorResponse
  >;

  type ApiMetaData = {
    KEY: string;
  };
  const usePayrollIntegrationOAuthDetails: UsePayrollIntegrationOAuthDetails;
  const PayrollIntegrationOAuthDetailsAPI: ApiMetaData;

  export {
    usePayrollIntegrationOAuthDetails,
    PayrollIntegrationOAuthDetailsAPI,
  };

  export type PayrollIntegrationOAuthUrlResponse = {
    data: PayrollIntegrationOAuthUrl;
  };

  export type PayrollIntegrationOAuthUrl = string;

  export type UsePayrollIntegrationOAuthUrl = (
    integration: PayrollIntegration,
    legalEntityId: string,
  ) => import('react-query').UseQueryResult<
    PayrollIntegrationOAuthUrl,
    PayrollIntegrationErrorResponse
  >;

  const usePayrollIntegrationOAuthUrl: UsePayrollIntegrationOAuthUrl;
  const PayrollIntegrationOAuthUrlAPI: ApiMetaData;

  export { usePayrollIntegrationOAuthUrl, PayrollIntegrationOAuthUrlAPI };

  export type PayrollIntegrationOAuthRevokeResponse = undefined;

  export type UseRevokePayrollIntegrationOAuth = (
    integration: PayrollIntegration,
    legalEntityId: string,
  ) => import('react-query').UseMutationResult<
    PayrollIntegrationOAuthRevokeResponse,
    PayrollIntegrationErrorResponse
  >;

  const useRevokePayrollIntegrationOAuth: UseRevokePayrollIntegrationOAuth;

  export { useRevokePayrollIntegrationOAuth };

  export type GetPayrollIntegrationOAuthUrlHandlers =
    import('./handlers').GetPayrollIntegrationOAuthUrlHandlers;
  export type GetPayrollIntegrationOAuthDetailsHandlers =
    import('./handlers').GetPayrollIntegrationOAuthDetailsHandlers;
  export type RevokePayrollIntegrationOAuthHandlers =
    import('./handlers').RevokePayrollIntegrationOAuthHandlers;
}

declare module 'payroll/data/payroll-integration-oauth' {
  export * from '@personio-web/payroll-data-payroll-integration-oauth-types';
}

declare module 'payroll/data/payroll-integration-oauth/handlers' {
  /* DO NOT DELETE - Auto generated handlers - Start */
  export const getPayrollIntegrationOAuthUrlHandlers: import('./handlers').GetPayrollIntegrationOAuthUrlHandlers;
  export const getPayrollIntegrationOAuthDetailsHandlers: import('./handlers').GetPayrollIntegrationOAuthDetailsHandlers;
  export const revokePayrollIntegrationOAuthHandlers: import('./handlers').RevokePayrollIntegrationOAuthHandlers;
  /* DO NOT DELETE - Auto generated handlers - End */
}

declare module '@personio-web/payroll-data-payroll-integration-oauth' {
  export * from '@personio-web/payroll-data-payroll-integration-oauth-types';
}

declare module 'payroll/registerMocks';
