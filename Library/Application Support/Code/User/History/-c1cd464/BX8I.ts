import { PayrollIntegrationErrorResponse } from '@personio-web/payroll-data-payroll-integration-oauth-types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

export type StyleToCamelCase<T> =
  import('@personio-web/payroll-util-common').StyleToCamelCase<T>;

/*********************** Pay Periods ******************************/
// GET Pay Periods
export type PayPeriodsErrorResponse = PayrollIntegrationErrorResponse;

export type PayPeriodsResponse = {
  data: PayPeriodsRaw;
};

export type PayPeriodsRaw = {
  grouping_by_attribute?: string;
  grouping_active: boolean;
  mappings: Array<{
    attribute_value: string;
    calendar_id?: string;
  }>;
  calendar_id?: string;
};
export type PayPeriods = StyleToCamelCase<PayPeriodsRaw>;

export type UsePayPeriodsData = (
  integration: PayrollIntegration,
  legalEntityId: string,
) => import('react-query').UseQueryResult<PayPeriods, PayPeriodsErrorResponse>;

// PUT Pay Periods
export type PutPayPeriodsErrorResponse = PayrollIntegrationErrorResponse;
export type PutPayPeriodsResponse = { data: undefined };
export type PutPayPeriodsPayload = PayPeriods;

export type UsePutPayPeriodsData = (
  integration: PayrollIntegration,
  legalEntityId: string,
) => import('react-query').UseMutationResult<
  undefined,
  PutPayPeriodsErrorResponse,
  PutPayPeriodsPayload
>;

/*********************** A3 Companies & Workplaces ******************************/
// GET A3 Companies
export type A3CompaniesErrorResponse = PayrollIntegrationErrorResponse;
export type A3CompaniesResponse = {
  data: {
    configuration: A3CompaniesRaw;
  };
};

export type A3CompaniesRaw = {
  company_mapping: {
    mapped_company_code: string | null;
    available_companies: Array<{
      company_code: string;
      company_name: string;
    }>;
  };
};
export type A3Companies = StyleToCamelCase<A3CompaniesRaw>;

export type UseA3CompaniesData = (
  legalEntityId: string,
) => import('react-query').UseQueryResult<
  A3Companies,
  A3CompaniesErrorResponse
>;

// GET A3 Workplaces
export type A3WorkplacesErrorResponse = PayrollIntegrationErrorResponse;
export type A3WorkplacesResponse = {
  data: {
    configuration: A3WorkplacesRaw;
  };
};

type PersonioOfficeRaw = {
  office_id: string;
  office_name: string;
};
export type PersonioOffice = StyleToCamelCase<PersonioOfficeRaw>;

type A3WorkplaceRaw = {
  workplace_code: string;
  workplace_name: string;
};
export type A3Workplace = StyleToCamelCase<A3WorkplaceRaw>;

type A3MappedOfficeRaw = {
  office_id: string;
  workplace_code: string;
};
export type A3MappedOffice = StyleToCamelCase<A3MappedOfficeRaw>;

export type A3WorkplacesRaw = {
  workplace_mapping: {
    mapped_offices: Array<A3MappedOfficeRaw>;
    available_offices: Array<PersonioOfficeRaw>;
    available_workplaces: Array<A3WorkplaceRaw>;
  };
};
export type A3Workplaces = StyleToCamelCase<A3WorkplacesRaw>;

export type UseA3WorkplacesData = (
  a3CompanyCode: string,
  legalEntityId: string,
) => import('react-query').UseQueryResult<
  A3Workplaces,
  A3WorkplacesErrorResponse
>;

// POST A3 Configuration
export type PostA3ConfigurationErrorResponse = PayrollIntegrationErrorResponse;
export type PostA3ConfigurationResponse = { data: undefined };
export type A3ConfigurationRaw = {
  configuration: {
    company_mapping: Omit<
      A3CompaniesRaw['company_mapping'],
      'available_companies'
    >;
    office_mapping: Omit<
      A3WorkplacesRaw['workplace_mapping'],
      'available_offices' | 'available_workplaces'
    >;
  };
};
export type PostA3ConfigurationPayload = StyleToCamelCase<
  A3ConfigurationRaw['configuration']
>;

export type UsePostA3ConfigurationData = (
  legalEntityId: string,
) => import('react-query').UseMutationResult<
  undefined,
  PostA3ConfigurationErrorResponse,
  PostA3ConfigurationPayload
>;
