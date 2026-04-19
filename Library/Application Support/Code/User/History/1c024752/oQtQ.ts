import type { CurrencyCode } from '@personio-web/payroll-service-utils';
import { PayrollIntegrationErrorResponse } from '@personio-web/payroll-data-payroll-integration-oauth-types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

export type StyleToCamelCase<T> =
  import('@personio-web/payroll-util-common').StyleToCamelCase<T>;

export type { PayrollIntegrationErrorResponse };

/*********************** People Data ******************************/
export type PeopleDataResponse = {
  data: (XeroPeopleDataRaw | A3PeopleDataRaw)[];
};

// Generic - shared across integrations
export type SharedPeopleDataRaw = {
  person: {
    id: string;
    first_name: string;
    last_name: string;
  };
  blockers: Array<{
    attribute_value: string;
    attribute_name: string;
    message: string;
  }>;
};

// Xero
export type XeroPeopleDataRaw = {
  gross_salary: {
    amount: number | null;
    currency: CurrencyCode | null;
    type: 'FIXED' | 'HOURLY' | null;
    prorated_externally?: boolean;
  };
  employee_number: string;
} & SharedPeopleDataRaw;

// A3
export type A3PeopleDataRaw = {
  office: {
    office_id: string;
    office_name: string;
  };
  employee_code: string;
} & SharedPeopleDataRaw;

type ReturnTypeMap = {
  xero: XeroPeopleDataRaw;
  a3: A3PeopleDataRaw;
};
export type SharedPeopleData = StyleToCamelCase<SharedPeopleDataRaw>;
export type PeopleData = StyleToCamelCase<ReturnTypeMap>;
export type XeroPeopleData = PeopleData['xero'];
export type A3PeopleData = PeopleData['a3'];

export type UsePeopleData = <T extends PayrollIntegration>(
  integration: T,
  legalEntityId?: string,
) => import('react-query').UseQueryResult<
  Array<StyleToCamelCase<ReturnTypeMap[T]>>,
  PayrollIntegrationErrorResponse
>;

/*********************** Transfer Employees ******************************/
export type PostTransferDataErrorResponse = PayrollIntegrationErrorResponse;
export type PostTransferDataResponse = {
  data: XeroTransferResultRaw | A3TransferResultRaw;
};

type EmployeeId = string;
type ApiError = {
  id?: string;
  status?: string;
  title?: string;
  detail: string;
};
export type SharedTransferResultRaw = {
  created_employee_ids: EmployeeId[];
  updated_employee_ids: EmployeeId[];
  not_updated_employee_ids: EmployeeId[];
  not_created_employee_ids: EmployeeId[];
  failures: Record<EmployeeId, Array<ApiError>>;
  blocking_errors: Array<ApiError>;
};
export type XeroTransferResultRaw = {
  emails_to_display: string[];
} & SharedTransferResultRaw;

export type A3TransferResultRaw = SharedTransferResultRaw;

export type TransferResult = {
  xero: StyleToCamelCase<XeroTransferResultRaw>;
  a3: StyleToCamelCase<A3TransferResultRaw>;
};

export type UsePostTransferData = <T extends PayrollIntegration>(
  integration: T,
  legalEntityId?: string,
) => import('react-query').UseMutationResult<
  TransferResult[T],
  PostTransferDataErrorResponse
>;

export type PostTransferRequest = <T extends PayrollIntegration>(
  integration: T,
  legalEntityId?: string,
) => Promise<TransferResult[T]>;
