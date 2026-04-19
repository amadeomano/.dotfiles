import { PayrollIntegrationErrorResponse } from '@personio-web/payroll-data-payroll-integration-oauth-types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
import { XeroTransferResultRaw } from '@personio-web/payroll-data-payroll-integration-hub-types';

export type StyleToCamelCase<T> =
  import('@personio-web/payroll-util-common').StyleToCamelCase<T>;

/*********************** Date Utility ******************************/
type TYear = `${number}${number}${number}${number}`;
type TMonth = `${number}${number}`;
type TDay = `${number}${number}`;
type THours = `${number}${number}`;
type TMinutes = `${number}${number}`;
type TSeconds = `${number}${number}`;
type TMilliseconds = `${number}${number}${number}`;

/**
 * Represent a string like `2021-01-08`
 */
type TDateISODate = `${TYear}-${TMonth}-${TDay}`;

/**
 * Represent a string like `14:42:34.678`
 */
type TDateISOTime = `${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}`;

/**
 * Represent a string like `2021-01-08T14:42:34.678Z` (format: ISO 8601).
 */
type TDateISO = `${TDateISODate}T${TDateISOTime}Z`;

/*********************** Legal Entities ******************************/
export type LegalEntitiesResponse = {
  data: { legal_entities: LegalEntities };
};
export type LegalEntitiesErrorResponse = PayrollIntegrationErrorResponse;

export type LegalEntities = Array<LegalEntity>;
export type LegalEntity = {
  id: string;
  name: string;
};

export type UseLegalEntities = () => import('react-query').UseQueryResult<
  LegalEntities,
  LegalEntitiesErrorResponse
>;

/*********************** Payroll Calendars ******************************/
export type PayrollFrequency = 'weekly' | 'monthly';

export type PayPeriod = {
  from: TDateISODate;
  to: TDateISODate;
};

export type PayrollIntegrationCalendarRaw = {
  frequency: PayrollFrequency;
  id: string;
  name: string;
  next_pay_period: PayPeriod;
  next_pay_day: TDateISODate;
};
export type PayCalendarsRaw = Array<PayrollIntegrationCalendarRaw>;
export type PayCalendarsResponse = {
  data: PayCalendarsRaw;
};
export type PayrollIntegrationCalendar =
  StyleToCamelCase<PayrollIntegrationCalendarRaw>;
export type PayCalendarsErrorResponse = PayrollIntegrationErrorResponse;

export type UsePayCalendars = (
  integration: PayrollIntegration,
  legalEntityId: string,
) => import('react-query').UseQueryResult<
  PayrollIntegrationCalendar[],
  PayCalendarsErrorResponse
>;

/*********************** Payroll Context ******************************/
export type PayrollContextErrorResponse = PayrollIntegrationErrorResponse;
export type PayrollContextResponse = {
  data: XeroContextRaw | A3ContextRaw;
};

// Xero
export type XeroContextRaw = {
  xero_context?: {
    transfer: XeroTransferStateRaw;
    redirect_urls: XeroRedirectUrlsRaw;
    settings: XeroSettingsRaw;
  };
} & PayrollContextRaw;

export type XeroTransferStateRaw = {
  state: 'PAY_RUN_DRAFT_EXISTS' | 'PROCESSING' | 'READY';
  result: XeroTransferResultRaw | null;
  last_triggered: string | null;
};
export type XeroTransferState = StyleToCamelCase<XeroTransferStateRaw>;

export type XeroSettingsRaw = {
  pay_periods: {
    grouping_by_attribute: {
      label: string;
      universal_id: string;
    };
    grouping_active: boolean;
    mappings: Array<{
      attribute: {
        label: string;
        value: string;
      };
      calendar?: PayrollIntegrationCalendarRaw;
    }>;
    calendar?: PayrollIntegrationCalendarRaw;
  };
};

export type XeroRedirectUrlsRaw = {
  pay_run_overview: string;
};

export type A3ContextRaw = {
  a3_context: {
    settings: {
      no_company_mapped: boolean;
      no_workplace_mapped: boolean;
    };
    current_pay_period: PayPeriod;
  };
} & PayrollContextRaw;

// Generic / Shared
export type PayrollContextRaw = {
  is_authorized: boolean;
  execution_context: ExecutionContextRaw;
};

export type ExecutionContextRaw = {
  last_successfully_used: TDateISO;
};

type ReturnTypeMap = {
  xero: XeroContextRaw;
  a3: A3ContextRaw;
  default: PayrollContextRaw;
};
export type PayrollContext = StyleToCamelCase<ReturnTypeMap>;

export type UsePayrollContextData = <T extends PayrollIntegration>(
  integration: T,
  legalEntityId?: string,
) => import('react-query').UseQueryResult<
  StyleToCamelCase<ReturnTypeMap[T]>,
  PayrollContextErrorResponse
>;
