declare module '@personio-web/payroll-data-payroll-integration-context-types' {
  /* DO NOT DELETE - Auto generated exports - Start */
  /* DO NOT DELETE - Auto generated exports - End */

  /*********************** Available Integrations **********************/
  export type PayrollIntegration = 'xero' | 'a3';

  /*********************** Legal Entities ******************************/
  export type LegalEntitiesErrorResponse =
    import('./types').LegalEntitiesErrorResponse;
  export type LegalEntitiesResponse = import('./types').LegalEntitiesResponse;

  export type LegalEntities = import('./types').LegalEntities;
  export type LegalEntity = import('./types').LegalEntity;

  export type GetLegalEntitiesHandlers =
    import('./handlers').GetLegalEntitiesHandlers;

  export type UseLegalEntities = import('./types').UseLegalEntities;

  const useLegalEntities: UseLegalEntities;
  export { useLegalEntities };

  /*********************** Payroll Calendars ******************************/
  export type PayrollFrequency = import('./types').PayrollFrequency;
  export type PayCalendarsResponse = import('./types').PayCalendarsResponse;
  export type PayCalendarsErrorResponse =
    import('./types').PayCalendarsErrorResponse;

  export type PayrollIntegrationCalendar =
    import('./types').PayrollIntegrationCalendar;

  export type GetPayCalendarsHandlers =
    import('./handlers').GetPayCalendarsHandlers;

  export type UsePayCalendars = import('./types').UsePayCalendars;

  const usePayCalendars: UsePayCalendars;
  export { usePayCalendars };

  /*********************** Payroll Period ******************************/

  export type PayrollPeriod = import('./types').PayPeriod;

  /*********************** Payroll Context ******************************/
  export type PayrollContextResponse = import('./types').PayrollContextResponse;
  export type PayrollContextErrorResponse =
    import('./types').PayrollContextErrorResponse;

  export type PayrollContextRaw = import('./types').PayrollContextRaw;
  export type XeroContextRaw = import('./types').XeroContextRaw;
  export type A3ContextRaw = import('./types').A3ContextRaw;
  export type PayrollContext = import('./types').PayrollContext;
  export type XeroTransferStateRaw = import('./types').XeroTransferStateRaw;
  export type XeroTransferState = import('./types').XeroTransferState;

  export type GetPayrollContextHandlers =
    import('./handlers').GetPayrollContextHandlers;

  export type UsePayrollContextData = import('./types').UsePayrollContextData;
  export const usePayrollContextData: UsePayrollContextData;
}

declare module 'payroll/data/payroll-integration-context' {
  export * from '@personio-web/payroll-data-payroll-integration-context-types';
  export const PayrollIntegrationContextAPI;
}

declare module 'payroll/data/payroll-integration-context/handlers' {
  /* DO NOT DELETE - Auto generated handlers - Start */
  export const getLegalEntitiesHandlers: import('./handlers').GetLegalEntitiesHandlers;
  export const getPayCalendarsHandlers: import('./handlers').GetPayCalendarsHandlers;
  export const getPayrollContextHandlers: import('./handlers').GetPayrollContextHandlers;
  /* DO NOT DELETE - Auto generated handlers - End */
}

declare module '@personio-web/payroll-data-payroll-integration-context' {
  export * from '@personio-web/payroll-data-payroll-integration-context-types';
  export const PayrollIntegrationContextAPI;
}

declare module 'payroll/registerMocks';
