/**
 * DO NOT MODIFY THIS FILE
 * This file in generated automatically by the @personio-web/nx-request-sync executor
 */

import type { AxiosError, AxiosRequestConfig } from 'axios';

type NormalizeParams<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
};

// getEmployeeAutoEnrolmentConfiguration

export type GetEmployeeAutoEnrolmentConfigurationPathParams =
  import('./schema.ts').operations['getEmployeeAutoEnrolmentConfiguration']['parameters']['path'];

export type HandlerGetEmployeeAutoEnrolmentConfigurationPathParams =
  NormalizeParams<GetEmployeeAutoEnrolmentConfigurationPathParams>;

export type GetEmployeeAutoEnrolmentConfigurationQuery = never;

export type GetEmployeeAutoEnrolmentConfigurationHeaders =
  import('./schema.ts').operations['getEmployeeAutoEnrolmentConfiguration']['parameters']['header'];

export type GetEmployeeAutoEnrolmentConfigurationBody = never;

export type GetEmployeeAutoEnrolmentConfigurationData200 =
  import('./schema.ts').operations['getEmployeeAutoEnrolmentConfiguration']['responses'][200]['content']['application/json'];

export type GetEmployeeAutoEnrolmentConfigurationData =
  GetEmployeeAutoEnrolmentConfigurationData200;

export type GetEmployeeAutoEnrolmentConfigurationDataResponse = {
  data: GetEmployeeAutoEnrolmentConfigurationData;
};

export type GetEmployeeAutoEnrolmentConfigurationErrorResponse = never;

export type GetEmployeeAutoEnrolmentConfigurationAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/auto-enrolment';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'getEmployeeAutoEnrolmentConfiguration';
  };
};

export type GetEmployeeAutoEnrolmentConfiguration = (options: {
  pathParams: GetEmployeeAutoEnrolmentConfigurationPathParams;
  headers: GetEmployeeAutoEnrolmentConfigurationHeaders;
}) => Promise<GetEmployeeAutoEnrolmentConfigurationData>;

export type UseGetEmployeeAutoEnrolmentConfigurationKey = [
  GetEmployeeAutoEnrolmentConfigurationAPI['KEY'],
  GetEmployeeAutoEnrolmentConfigurationPathParams,
  GetEmployeeAutoEnrolmentConfigurationHeaders,
];

export type UseGetEmployeeAutoEnrolmentConfigurationOptions<
  Selection = GetEmployeeAutoEnrolmentConfigurationData,
> = import('react-query').UseQueryOptions<
  GetEmployeeAutoEnrolmentConfigurationData,
  AxiosError<GetEmployeeAutoEnrolmentConfigurationErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseGetEmployeeAutoEnrolmentConfigurationKey>
> & {
  select?: (data: GetEmployeeAutoEnrolmentConfigurationData) => Selection;
  requestPathParams: GetEmployeeAutoEnrolmentConfigurationPathParams;
  requestHeaders: GetEmployeeAutoEnrolmentConfigurationHeaders;
};

export type UseGetEmployeeAutoEnrolmentConfiguration = <
  Selection = GetEmployeeAutoEnrolmentConfigurationData,
>(
  options: UseGetEmployeeAutoEnrolmentConfigurationOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetEmployeeAutoEnrolmentConfigurationErrorResponse>
>;

// updatePendingAutoenrolmentAction

export type UpdatePendingAutoenrolmentActionPathParams =
  import('./schema.ts').operations['updatePendingAutoenrolmentAction']['parameters']['path'];

export type HandlerUpdatePendingAutoenrolmentActionPathParams =
  NormalizeParams<UpdatePendingAutoenrolmentActionPathParams>;

export type UpdatePendingAutoenrolmentActionQuery = never;

export type UpdatePendingAutoenrolmentActionHeaders =
  import('./schema.ts').operations['updatePendingAutoenrolmentAction']['parameters']['header'];

export type UpdatePendingAutoenrolmentActionBody = NonNullable<
  import('./schema.ts').operations['updatePendingAutoenrolmentAction']['requestBody']
>['content']['application/json'];

export type UpdatePendingAutoenrolmentActionData200 =
  import('./schema.ts').operations['updatePendingAutoenrolmentAction']['responses'][200]['content']['application/json'];

export type UpdatePendingAutoenrolmentActionData =
  UpdatePendingAutoenrolmentActionData200;

export type UpdatePendingAutoenrolmentActionDataResponse = {
  data: UpdatePendingAutoenrolmentActionData;
};

export type UpdatePendingAutoenrolmentActionErrorResponse = never;

export type UpdatePendingAutoenrolmentActionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/auto-enrolment/action';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updatePendingAutoenrolmentAction';
  };
};

export type UpdatePendingAutoenrolmentAction = (options: {
  pathParams: UpdatePendingAutoenrolmentActionPathParams;
  data: UpdatePendingAutoenrolmentActionBody;
  headers: UpdatePendingAutoenrolmentActionHeaders;
}) => Promise<UpdatePendingAutoenrolmentActionData>;

export type UseUpdatePendingAutoenrolmentActionKey = [
  UpdatePendingAutoenrolmentActionAPI['KEY'],
];

export type UseUpdatePendingAutoenrolmentActionOptions =
  import('react-query').UseMutationOptions<
    UpdatePendingAutoenrolmentActionData,
    AxiosError<UpdatePendingAutoenrolmentActionErrorResponse>,
    {
      requestPathParams: UpdatePendingAutoenrolmentActionPathParams;
      requestBody: UpdatePendingAutoenrolmentActionBody;
      requestHeaders: UpdatePendingAutoenrolmentActionHeaders;
    }
  >;

export type UseUpdatePendingAutoenrolmentAction = (
  options?: UseUpdatePendingAutoenrolmentActionOptions,
) => import('react-query').UseMutationResult<
  UpdatePendingAutoenrolmentActionData,
  AxiosError<UpdatePendingAutoenrolmentActionErrorResponse>,
  {
    requestPathParams: UpdatePendingAutoenrolmentActionPathParams;
    requestBody: UpdatePendingAutoenrolmentActionBody;
    requestHeaders: UpdatePendingAutoenrolmentActionHeaders;
  }
>;

// updateEmployeeAutoEnrolmentHistoricalAssessment

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentPathParams =
  import('./schema.ts').operations['updateEmployeeAutoEnrolmentHistoricalAssessment']['parameters']['path'];

export type HandlerUpdateEmployeeAutoEnrolmentHistoricalAssessmentPathParams =
  NormalizeParams<UpdateEmployeeAutoEnrolmentHistoricalAssessmentPathParams>;

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentQuery = never;

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentHeaders =
  import('./schema.ts').operations['updateEmployeeAutoEnrolmentHistoricalAssessment']['parameters']['header'];

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentBody = NonNullable<
  import('./schema.ts').operations['updateEmployeeAutoEnrolmentHistoricalAssessment']['requestBody']
>['content']['application/json'];

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentData200 =
  import('./schema.ts').operations['updateEmployeeAutoEnrolmentHistoricalAssessment']['responses'][200]['content']['application/json'];

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentData =
  UpdateEmployeeAutoEnrolmentHistoricalAssessmentData200;

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentDataResponse = {
  data: UpdateEmployeeAutoEnrolmentHistoricalAssessmentData;
};

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentErrorResponse =
  never;

export type UpdateEmployeeAutoEnrolmentHistoricalAssessmentAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/auto-enrolment/historical';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateEmployeeAutoEnrolmentHistoricalAssessment';
  };
};

export type UpdateEmployeeAutoEnrolmentHistoricalAssessment = (options: {
  pathParams: UpdateEmployeeAutoEnrolmentHistoricalAssessmentPathParams;
  data: UpdateEmployeeAutoEnrolmentHistoricalAssessmentBody;
  headers: UpdateEmployeeAutoEnrolmentHistoricalAssessmentHeaders;
}) => Promise<UpdateEmployeeAutoEnrolmentHistoricalAssessmentData>;

export type UseUpdateEmployeeAutoEnrolmentHistoricalAssessmentKey = [
  UpdateEmployeeAutoEnrolmentHistoricalAssessmentAPI['KEY'],
];

export type UseUpdateEmployeeAutoEnrolmentHistoricalAssessmentOptions =
  import('react-query').UseMutationOptions<
    UpdateEmployeeAutoEnrolmentHistoricalAssessmentData,
    AxiosError<UpdateEmployeeAutoEnrolmentHistoricalAssessmentErrorResponse>,
    {
      requestPathParams: UpdateEmployeeAutoEnrolmentHistoricalAssessmentPathParams;
      requestBody: UpdateEmployeeAutoEnrolmentHistoricalAssessmentBody;
      requestHeaders: UpdateEmployeeAutoEnrolmentHistoricalAssessmentHeaders;
    }
  >;

export type UseUpdateEmployeeAutoEnrolmentHistoricalAssessment = (
  options?: UseUpdateEmployeeAutoEnrolmentHistoricalAssessmentOptions,
) => import('react-query').UseMutationResult<
  UpdateEmployeeAutoEnrolmentHistoricalAssessmentData,
  AxiosError<UpdateEmployeeAutoEnrolmentHistoricalAssessmentErrorResponse>,
  {
    requestPathParams: UpdateEmployeeAutoEnrolmentHistoricalAssessmentPathParams;
    requestBody: UpdateEmployeeAutoEnrolmentHistoricalAssessmentBody;
    requestHeaders: UpdateEmployeeAutoEnrolmentHistoricalAssessmentHeaders;
  }
>;

// renderEmployeePayslip

export type RenderEmployeePayslipPathParams =
  import('./schema.ts').operations['renderEmployeePayslip']['parameters']['path'];

export type HandlerRenderEmployeePayslipPathParams =
  NormalizeParams<RenderEmployeePayslipPathParams>;

export type RenderEmployeePayslipQuery = never;

export type RenderEmployeePayslipHeaders =
  import('./schema.ts').operations['renderEmployeePayslip']['parameters']['header'];

export type RenderEmployeePayslipBody = never;

export type RenderEmployeePayslipData200 =
  import('./schema.ts').operations['renderEmployeePayslip']['responses'][200]['content']['application/pdf'];

export type RenderEmployeePayslipErrorResponse404 =
  import('./schema.ts').operations['renderEmployeePayslip']['responses'][404]['content']['application/pdf'];

export type RenderEmployeePayslipData = RenderEmployeePayslipData200;

export type RenderEmployeePayslipDataResponse = {
  data: RenderEmployeePayslipData;
};

export type RenderEmployeePayslipErrorResponse =
  RenderEmployeePayslipErrorResponse404;

export type RenderEmployeePayslipAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/payslips/:payslipId/preview';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'renderEmployeePayslip';
  };
};

export type RenderEmployeePayslip = (options: {
  pathParams: RenderEmployeePayslipPathParams;
  headers: RenderEmployeePayslipHeaders;
}) => Promise<RenderEmployeePayslipData>;

export type UseRenderEmployeePayslipKey = [RenderEmployeePayslipAPI['KEY']];

export type UseRenderEmployeePayslipOptions =
  import('react-query').UseMutationOptions<
    RenderEmployeePayslipData,
    AxiosError<RenderEmployeePayslipErrorResponse>,
    {
      requestPathParams: RenderEmployeePayslipPathParams;
      requestHeaders: RenderEmployeePayslipHeaders;
    }
  >;

export type UseRenderEmployeePayslip = (
  options?: UseRenderEmployeePayslipOptions,
) => import('react-query').UseMutationResult<
  RenderEmployeePayslipData,
  AxiosError<RenderEmployeePayslipErrorResponse>,
  {
    requestPathParams: RenderEmployeePayslipPathParams;
    requestHeaders: RenderEmployeePayslipHeaders;
  } & AxiosRequestConfig
>;

// listEmployeePensions

export type ListEmployeePensionsPathParams =
  import('./schema.ts').operations['listEmployeePensions']['parameters']['path'];

export type HandlerListEmployeePensionsPathParams =
  NormalizeParams<ListEmployeePensionsPathParams>;

export type ListEmployeePensionsQuery = never;

export type ListEmployeePensionsHeaders =
  import('./schema.ts').operations['listEmployeePensions']['parameters']['header'];

export type ListEmployeePensionsBody = never;

export type ListEmployeePensionsData200 =
  import('./schema.ts').operations['listEmployeePensions']['responses'][200]['content']['application/json'];

export type ListEmployeePensionsData = ListEmployeePensionsData200;

export type ListEmployeePensionsDataResponse = {
  data: ListEmployeePensionsData;
};

export type ListEmployeePensionsErrorResponse = never;

export type ListEmployeePensionsAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listEmployeePensions';
  };
};

export type ListEmployeePensions = (options: {
  pathParams: ListEmployeePensionsPathParams;
  headers: ListEmployeePensionsHeaders;
}) => Promise<ListEmployeePensionsData>;

export type UseListEmployeePensionsKey = [
  ListEmployeePensionsAPI['KEY'],
  ListEmployeePensionsPathParams,
  ListEmployeePensionsHeaders,
];

export type UseListEmployeePensionsOptions<
  Selection = ListEmployeePensionsData,
> = import('react-query').UseQueryOptions<
  ListEmployeePensionsData,
  AxiosError<ListEmployeePensionsErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListEmployeePensionsKey>
> & {
  select?: (data: ListEmployeePensionsData) => Selection;
  requestPathParams: ListEmployeePensionsPathParams;
  requestHeaders: ListEmployeePensionsHeaders;
};

export type UseListEmployeePensions = <Selection = ListEmployeePensionsData>(
  options: UseListEmployeePensionsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListEmployeePensionsErrorResponse>
>;

// createEmployeePension

export type CreateEmployeePensionPathParams =
  import('./schema.ts').operations['createEmployeePension']['parameters']['path'];

export type HandlerCreateEmployeePensionPathParams =
  NormalizeParams<CreateEmployeePensionPathParams>;

export type CreateEmployeePensionQuery = never;

export type CreateEmployeePensionHeaders =
  import('./schema.ts').operations['createEmployeePension']['parameters']['header'];

export type CreateEmployeePensionBody = NonNullable<
  import('./schema.ts').operations['createEmployeePension']['requestBody']
>['content']['application/json'];

export type CreateEmployeePensionData200 =
  import('./schema.ts').operations['createEmployeePension']['responses'][200]['content']['application/json'];

export type CreateEmployeePensionData = CreateEmployeePensionData200;

export type CreateEmployeePensionDataResponse = {
  data: CreateEmployeePensionData;
};

export type CreateEmployeePensionErrorResponse = never;

export type CreateEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createEmployeePension';
  };
};

export type CreateEmployeePension = (options: {
  pathParams: CreateEmployeePensionPathParams;
  data: CreateEmployeePensionBody;
  headers: CreateEmployeePensionHeaders;
}) => Promise<CreateEmployeePensionData>;

export type UseCreateEmployeePensionKey = [CreateEmployeePensionAPI['KEY']];

export type UseCreateEmployeePensionOptions =
  import('react-query').UseMutationOptions<
    CreateEmployeePensionData,
    AxiosError<CreateEmployeePensionErrorResponse>,
    {
      requestPathParams: CreateEmployeePensionPathParams;
      requestBody: CreateEmployeePensionBody;
      requestHeaders: CreateEmployeePensionHeaders;
    }
  >;

export type UseCreateEmployeePension = (
  options?: UseCreateEmployeePensionOptions,
) => import('react-query').UseMutationResult<
  CreateEmployeePensionData,
  AxiosError<CreateEmployeePensionErrorResponse>,
  {
    requestPathParams: CreateEmployeePensionPathParams;
    requestBody: CreateEmployeePensionBody;
    requestHeaders: CreateEmployeePensionHeaders;
  }
>;

// getEmployeePension

export type GetEmployeePensionPathParams =
  import('./schema.ts').operations['getEmployeePension']['parameters']['path'];

export type HandlerGetEmployeePensionPathParams =
  NormalizeParams<GetEmployeePensionPathParams>;

export type GetEmployeePensionQuery = never;

export type GetEmployeePensionHeaders =
  import('./schema.ts').operations['getEmployeePension']['parameters']['header'];

export type GetEmployeePensionBody = never;

export type GetEmployeePensionData200 =
  import('./schema.ts').operations['getEmployeePension']['responses'][200]['content']['application/json'];

export type GetEmployeePensionData = GetEmployeePensionData200;

export type GetEmployeePensionDataResponse = { data: GetEmployeePensionData };

export type GetEmployeePensionErrorResponse = never;

export type GetEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions/:id';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'getEmployeePension';
  };
};

export type GetEmployeePension = (options: {
  pathParams: GetEmployeePensionPathParams;
  headers: GetEmployeePensionHeaders;
}) => Promise<GetEmployeePensionData>;

export type UseGetEmployeePensionKey = [
  GetEmployeePensionAPI['KEY'],
  GetEmployeePensionPathParams,
  GetEmployeePensionHeaders,
];

export type UseGetEmployeePensionOptions<Selection = GetEmployeePensionData> =
  import('react-query').UseQueryOptions<
    GetEmployeePensionData,
    AxiosError<GetEmployeePensionErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseGetEmployeePensionKey>
  > & {
    select?: (data: GetEmployeePensionData) => Selection;
    requestPathParams: GetEmployeePensionPathParams;
    requestHeaders: GetEmployeePensionHeaders;
  };

export type UseGetEmployeePension = <Selection = GetEmployeePensionData>(
  options: UseGetEmployeePensionOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetEmployeePensionErrorResponse>
>;

// updateEmployeePension

export type UpdateEmployeePensionPathParams =
  import('./schema.ts').operations['updateEmployeePension']['parameters']['path'];

export type HandlerUpdateEmployeePensionPathParams =
  NormalizeParams<UpdateEmployeePensionPathParams>;

export type UpdateEmployeePensionQuery = never;

export type UpdateEmployeePensionHeaders =
  import('./schema.ts').operations['updateEmployeePension']['parameters']['header'];

export type UpdateEmployeePensionBody = NonNullable<
  import('./schema.ts').operations['updateEmployeePension']['requestBody']
>['content']['application/json'];

export type UpdateEmployeePensionData200 =
  import('./schema.ts').operations['updateEmployeePension']['responses'][200]['content']['application/json'];

export type UpdateEmployeePensionData = UpdateEmployeePensionData200;

export type UpdateEmployeePensionDataResponse = {
  data: UpdateEmployeePensionData;
};

export type UpdateEmployeePensionErrorResponse = never;

export type UpdateEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions/:id';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateEmployeePension';
  };
};

export type UpdateEmployeePension = (options: {
  pathParams: UpdateEmployeePensionPathParams;
  data: UpdateEmployeePensionBody;
  headers: UpdateEmployeePensionHeaders;
}) => Promise<UpdateEmployeePensionData>;

export type UseUpdateEmployeePensionKey = [UpdateEmployeePensionAPI['KEY']];

export type UseUpdateEmployeePensionOptions =
  import('react-query').UseMutationOptions<
    UpdateEmployeePensionData,
    AxiosError<UpdateEmployeePensionErrorResponse>,
    {
      requestPathParams: UpdateEmployeePensionPathParams;
      requestBody: UpdateEmployeePensionBody;
      requestHeaders: UpdateEmployeePensionHeaders;
    }
  >;

export type UseUpdateEmployeePension = (
  options?: UseUpdateEmployeePensionOptions,
) => import('react-query').UseMutationResult<
  UpdateEmployeePensionData,
  AxiosError<UpdateEmployeePensionErrorResponse>,
  {
    requestPathParams: UpdateEmployeePensionPathParams;
    requestBody: UpdateEmployeePensionBody;
    requestHeaders: UpdateEmployeePensionHeaders;
  }
>;

// deleteEmployeePension

export type DeleteEmployeePensionPathParams =
  import('./schema.ts').operations['deleteEmployeePension']['parameters']['path'];

export type HandlerDeleteEmployeePensionPathParams =
  NormalizeParams<DeleteEmployeePensionPathParams>;

export type DeleteEmployeePensionQuery = never;

export type DeleteEmployeePensionHeaders =
  import('./schema.ts').operations['deleteEmployeePension']['parameters']['header'];

export type DeleteEmployeePensionBody = never;

export type DeleteEmployeePensionData204 = undefined;

export type DeleteEmployeePensionErrorResponse404 =
  import('./schema.ts').operations['deleteEmployeePension']['responses'][404]['content']['application/json'];

export type DeleteEmployeePensionData = DeleteEmployeePensionData204;

export type DeleteEmployeePensionDataResponse = {
  data: DeleteEmployeePensionData;
};

export type DeleteEmployeePensionErrorResponse =
  DeleteEmployeePensionErrorResponse404;

export type DeleteEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions/:id';
  METHOD: 'DELETE';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'deleteEmployeePension';
  };
};

export type DeleteEmployeePension = (options: {
  pathParams: DeleteEmployeePensionPathParams;
  headers: DeleteEmployeePensionHeaders;
}) => Promise<DeleteEmployeePensionData>;

export type UseDeleteEmployeePensionKey = [DeleteEmployeePensionAPI['KEY']];

export type UseDeleteEmployeePensionOptions =
  import('react-query').UseMutationOptions<
    DeleteEmployeePensionData,
    AxiosError<DeleteEmployeePensionErrorResponse>,
    {
      requestPathParams: DeleteEmployeePensionPathParams;
      requestHeaders: DeleteEmployeePensionHeaders;
    }
  >;

export type UseDeleteEmployeePension = (
  options?: UseDeleteEmployeePensionOptions,
) => import('react-query').UseMutationResult<
  DeleteEmployeePensionData,
  AxiosError<DeleteEmployeePensionErrorResponse>,
  {
    requestPathParams: DeleteEmployeePensionPathParams;
    requestHeaders: DeleteEmployeePensionHeaders;
  }
>;

// listEmployerPensionSchemes

export type ListEmployerPensionSchemesPathParams = never;

export type HandlerListEmployerPensionSchemesPathParams =
  NormalizeParams<ListEmployerPensionSchemesPathParams>;

export type ListEmployerPensionSchemesQuery = never;

export type ListEmployerPensionSchemesHeaders =
  import('./schema.ts').operations['listEmployerPensionSchemes']['parameters']['header'];

export type ListEmployerPensionSchemesBody = never;

export type ListEmployerPensionSchemesData200 =
  import('./schema.ts').operations['listEmployerPensionSchemes']['responses'][200]['content']['application/json'];

export type ListEmployerPensionSchemesData = ListEmployerPensionSchemesData200;

export type ListEmployerPensionSchemesDataResponse = {
  data: ListEmployerPensionSchemesData;
};

export type ListEmployerPensionSchemesErrorResponse = never;

export type ListEmployerPensionSchemesAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listEmployerPensionSchemes';
  };
};

export type ListEmployerPensionSchemes = (options: {
  headers: ListEmployerPensionSchemesHeaders;
}) => Promise<ListEmployerPensionSchemesData>;

export type UseListEmployerPensionSchemesKey = [
  ListEmployerPensionSchemesAPI['KEY'],
  ListEmployerPensionSchemesHeaders,
];

export type UseListEmployerPensionSchemesOptions<
  Selection = ListEmployerPensionSchemesData,
> = import('react-query').UseQueryOptions<
  ListEmployerPensionSchemesData,
  AxiosError<ListEmployerPensionSchemesErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListEmployerPensionSchemesKey>
> & {
  select?: (data: ListEmployerPensionSchemesData) => Selection;
  requestHeaders: ListEmployerPensionSchemesHeaders;
};

export type UseListEmployerPensionSchemes = <
  Selection = ListEmployerPensionSchemesData,
>(
  options: UseListEmployerPensionSchemesOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListEmployerPensionSchemesErrorResponse>
>;

// createEmployerPensionScheme

export type CreateEmployerPensionSchemePathParams = never;

export type HandlerCreateEmployerPensionSchemePathParams =
  NormalizeParams<CreateEmployerPensionSchemePathParams>;

export type CreateEmployerPensionSchemeQuery = never;

export type CreateEmployerPensionSchemeHeaders =
  import('./schema.ts').operations['createEmployerPensionScheme']['parameters']['header'];

export type CreateEmployerPensionSchemeBody = NonNullable<
  import('./schema.ts').operations['createEmployerPensionScheme']['requestBody']
>['content']['application/json'];

export type CreateEmployerPensionSchemeData200 =
  import('./schema.ts').operations['createEmployerPensionScheme']['responses'][200]['content']['application/json'];

export type CreateEmployerPensionSchemeData =
  CreateEmployerPensionSchemeData200;

export type CreateEmployerPensionSchemeDataResponse = {
  data: CreateEmployerPensionSchemeData;
};

export type CreateEmployerPensionSchemeErrorResponse = never;

export type CreateEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createEmployerPensionScheme';
  };
};

export type CreateEmployerPensionScheme = (options: {
  data: CreateEmployerPensionSchemeBody;
  headers: CreateEmployerPensionSchemeHeaders;
}) => Promise<CreateEmployerPensionSchemeData>;

export type UseCreateEmployerPensionSchemeKey = [
  CreateEmployerPensionSchemeAPI['KEY'],
];

export type UseCreateEmployerPensionSchemeOptions =
  import('react-query').UseMutationOptions<
    CreateEmployerPensionSchemeData,
    AxiosError<CreateEmployerPensionSchemeErrorResponse>,
    {
      requestBody: CreateEmployerPensionSchemeBody;
      requestHeaders: CreateEmployerPensionSchemeHeaders;
    }
  >;

export type UseCreateEmployerPensionScheme = (
  options?: UseCreateEmployerPensionSchemeOptions,
) => import('react-query').UseMutationResult<
  CreateEmployerPensionSchemeData,
  AxiosError<CreateEmployerPensionSchemeErrorResponse>,
  {
    requestBody: CreateEmployerPensionSchemeBody;
    requestHeaders: CreateEmployerPensionSchemeHeaders;
  }
>;

// getEmployerPensionScheme

export type GetEmployerPensionSchemePathParams =
  import('./schema.ts').operations['getEmployerPensionScheme']['parameters']['path'];

export type HandlerGetEmployerPensionSchemePathParams =
  NormalizeParams<GetEmployerPensionSchemePathParams>;

export type GetEmployerPensionSchemeQuery = never;

export type GetEmployerPensionSchemeHeaders =
  import('./schema.ts').operations['getEmployerPensionScheme']['parameters']['header'];

export type GetEmployerPensionSchemeBody = never;

export type GetEmployerPensionSchemeData200 =
  import('./schema.ts').operations['getEmployerPensionScheme']['responses'][200]['content']['application/json'];

export type GetEmployerPensionSchemeData = GetEmployerPensionSchemeData200;

export type GetEmployerPensionSchemeDataResponse = {
  data: GetEmployerPensionSchemeData;
};

export type GetEmployerPensionSchemeErrorResponse = never;

export type GetEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:id';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'getEmployerPensionScheme';
  };
};

export type GetEmployerPensionScheme = (options: {
  pathParams: GetEmployerPensionSchemePathParams;
  headers: GetEmployerPensionSchemeHeaders;
}) => Promise<GetEmployerPensionSchemeData>;

export type UseGetEmployerPensionSchemeKey = [
  GetEmployerPensionSchemeAPI['KEY'],
  GetEmployerPensionSchemePathParams,
  GetEmployerPensionSchemeHeaders,
];

export type UseGetEmployerPensionSchemeOptions<
  Selection = GetEmployerPensionSchemeData,
> = import('react-query').UseQueryOptions<
  GetEmployerPensionSchemeData,
  AxiosError<GetEmployerPensionSchemeErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseGetEmployerPensionSchemeKey>
> & {
  select?: (data: GetEmployerPensionSchemeData) => Selection;
  requestPathParams: GetEmployerPensionSchemePathParams;
  requestHeaders: GetEmployerPensionSchemeHeaders;
};

export type UseGetEmployerPensionScheme = <
  Selection = GetEmployerPensionSchemeData,
>(
  options: UseGetEmployerPensionSchemeOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetEmployerPensionSchemeErrorResponse>
>;

// updateEmployerPensionScheme

export type UpdateEmployerPensionSchemePathParams =
  import('./schema.ts').operations['updateEmployerPensionScheme']['parameters']['path'];

export type HandlerUpdateEmployerPensionSchemePathParams =
  NormalizeParams<UpdateEmployerPensionSchemePathParams>;

export type UpdateEmployerPensionSchemeQuery = never;

export type UpdateEmployerPensionSchemeHeaders =
  import('./schema.ts').operations['updateEmployerPensionScheme']['parameters']['header'];

export type UpdateEmployerPensionSchemeBody = NonNullable<
  import('./schema.ts').operations['updateEmployerPensionScheme']['requestBody']
>['content']['application/json'];

export type UpdateEmployerPensionSchemeData200 =
  import('./schema.ts').operations['updateEmployerPensionScheme']['responses'][200]['content']['application/json'];

export type UpdateEmployerPensionSchemeData =
  UpdateEmployerPensionSchemeData200;

export type UpdateEmployerPensionSchemeDataResponse = {
  data: UpdateEmployerPensionSchemeData;
};

export type UpdateEmployerPensionSchemeErrorResponse = never;

export type UpdateEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:id';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateEmployerPensionScheme';
  };
};

export type UpdateEmployerPensionScheme = (options: {
  pathParams: UpdateEmployerPensionSchemePathParams;
  data: UpdateEmployerPensionSchemeBody;
  headers: UpdateEmployerPensionSchemeHeaders;
}) => Promise<UpdateEmployerPensionSchemeData>;

export type UseUpdateEmployerPensionSchemeKey = [
  UpdateEmployerPensionSchemeAPI['KEY'],
];

export type UseUpdateEmployerPensionSchemeOptions =
  import('react-query').UseMutationOptions<
    UpdateEmployerPensionSchemeData,
    AxiosError<UpdateEmployerPensionSchemeErrorResponse>,
    {
      requestPathParams: UpdateEmployerPensionSchemePathParams;
      requestBody: UpdateEmployerPensionSchemeBody;
      requestHeaders: UpdateEmployerPensionSchemeHeaders;
    }
  >;

export type UseUpdateEmployerPensionScheme = (
  options?: UseUpdateEmployerPensionSchemeOptions,
) => import('react-query').UseMutationResult<
  UpdateEmployerPensionSchemeData,
  AxiosError<UpdateEmployerPensionSchemeErrorResponse>,
  {
    requestPathParams: UpdateEmployerPensionSchemePathParams;
    requestBody: UpdateEmployerPensionSchemeBody;
    requestHeaders: UpdateEmployerPensionSchemeHeaders;
  }
>;

// deleteEmployerPensionScheme

export type DeleteEmployerPensionSchemePathParams =
  import('./schema.ts').operations['deleteEmployerPensionScheme']['parameters']['path'];

export type HandlerDeleteEmployerPensionSchemePathParams =
  NormalizeParams<DeleteEmployerPensionSchemePathParams>;

export type DeleteEmployerPensionSchemeQuery = never;

export type DeleteEmployerPensionSchemeHeaders =
  import('./schema.ts').operations['deleteEmployerPensionScheme']['parameters']['header'];

export type DeleteEmployerPensionSchemeBody = never;

export type DeleteEmployerPensionSchemeData204 = undefined;

export type DeleteEmployerPensionSchemeErrorResponse404 =
  import('./schema.ts').operations['deleteEmployerPensionScheme']['responses'][404]['content']['application/json'];

export type DeleteEmployerPensionSchemeData =
  DeleteEmployerPensionSchemeData204;

export type DeleteEmployerPensionSchemeDataResponse = {
  data: DeleteEmployerPensionSchemeData;
};

export type DeleteEmployerPensionSchemeErrorResponse =
  DeleteEmployerPensionSchemeErrorResponse404;

export type DeleteEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:id';
  METHOD: 'DELETE';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'deleteEmployerPensionScheme';
  };
};

export type DeleteEmployerPensionScheme = (options: {
  pathParams: DeleteEmployerPensionSchemePathParams;
  headers: DeleteEmployerPensionSchemeHeaders;
}) => Promise<DeleteEmployerPensionSchemeData>;

export type UseDeleteEmployerPensionSchemeKey = [
  DeleteEmployerPensionSchemeAPI['KEY'],
];

export type UseDeleteEmployerPensionSchemeOptions =
  import('react-query').UseMutationOptions<
    DeleteEmployerPensionSchemeData,
    AxiosError<DeleteEmployerPensionSchemeErrorResponse>,
    {
      requestPathParams: DeleteEmployerPensionSchemePathParams;
      requestHeaders: DeleteEmployerPensionSchemeHeaders;
    }
  >;

export type UseDeleteEmployerPensionScheme = (
  options?: UseDeleteEmployerPensionSchemeOptions,
) => import('react-query').UseMutationResult<
  DeleteEmployerPensionSchemeData,
  AxiosError<DeleteEmployerPensionSchemeErrorResponse>,
  {
    requestPathParams: DeleteEmployerPensionSchemePathParams;
    requestHeaders: DeleteEmployerPensionSchemeHeaders;
  }
>;

// listPensionContributionGroups

export type ListPensionContributionGroupsPathParams =
  import('./schema.ts').operations['listPensionContributionGroups']['parameters']['path'];

export type HandlerListPensionContributionGroupsPathParams =
  NormalizeParams<ListPensionContributionGroupsPathParams>;

export type ListPensionContributionGroupsQuery = never;

export type ListPensionContributionGroupsHeaders =
  import('./schema.ts').operations['listPensionContributionGroups']['parameters']['header'];

export type ListPensionContributionGroupsBody = never;

export type ListPensionContributionGroupsData200 =
  import('./schema.ts').operations['listPensionContributionGroups']['responses'][200]['content']['application/json'];

export type ListPensionContributionGroupsData =
  ListPensionContributionGroupsData200;

export type ListPensionContributionGroupsDataResponse = {
  data: ListPensionContributionGroupsData;
};

export type ListPensionContributionGroupsErrorResponse = never;

export type ListPensionContributionGroupsAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listPensionContributionGroups';
  };
};

export type ListPensionContributionGroups = (options: {
  pathParams: ListPensionContributionGroupsPathParams;
  headers: ListPensionContributionGroupsHeaders;
}) => Promise<ListPensionContributionGroupsData>;

export type UseListPensionContributionGroupsKey = [
  ListPensionContributionGroupsAPI['KEY'],
  ListPensionContributionGroupsPathParams,
  ListPensionContributionGroupsHeaders,
];

export type UseListPensionContributionGroupsOptions<
  Selection = ListPensionContributionGroupsData,
> = import('react-query').UseQueryOptions<
  ListPensionContributionGroupsData,
  AxiosError<ListPensionContributionGroupsErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListPensionContributionGroupsKey>
> & {
  select?: (data: ListPensionContributionGroupsData) => Selection;
  requestPathParams: ListPensionContributionGroupsPathParams;
  requestHeaders: ListPensionContributionGroupsHeaders;
};

export type UseListPensionContributionGroups = <
  Selection = ListPensionContributionGroupsData,
>(
  options: UseListPensionContributionGroupsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListPensionContributionGroupsErrorResponse>
>;

// createPensionContributionGroup

export type CreatePensionContributionGroupPathParams =
  import('./schema.ts').operations['createPensionContributionGroup']['parameters']['path'];

export type HandlerCreatePensionContributionGroupPathParams =
  NormalizeParams<CreatePensionContributionGroupPathParams>;

export type CreatePensionContributionGroupQuery = never;

export type CreatePensionContributionGroupHeaders =
  import('./schema.ts').operations['createPensionContributionGroup']['parameters']['header'];

export type CreatePensionContributionGroupBody = NonNullable<
  import('./schema.ts').operations['createPensionContributionGroup']['requestBody']
>['content']['application/json'];

export type CreatePensionContributionGroupData200 =
  import('./schema.ts').operations['createPensionContributionGroup']['responses'][200]['content']['application/json'];

export type CreatePensionContributionGroupData =
  CreatePensionContributionGroupData200;

export type CreatePensionContributionGroupDataResponse = {
  data: CreatePensionContributionGroupData;
};

export type CreatePensionContributionGroupErrorResponse = never;

export type CreatePensionContributionGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createPensionContributionGroup';
  };
};

export type CreatePensionContributionGroup = (options: {
  pathParams: CreatePensionContributionGroupPathParams;
  data: CreatePensionContributionGroupBody;
  headers: CreatePensionContributionGroupHeaders;
}) => Promise<CreatePensionContributionGroupData>;

export type UseCreatePensionContributionGroupKey = [
  CreatePensionContributionGroupAPI['KEY'],
];

export type UseCreatePensionContributionGroupOptions =
  import('react-query').UseMutationOptions<
    CreatePensionContributionGroupData,
    AxiosError<CreatePensionContributionGroupErrorResponse>,
    {
      requestPathParams: CreatePensionContributionGroupPathParams;
      requestBody: CreatePensionContributionGroupBody;
      requestHeaders: CreatePensionContributionGroupHeaders;
    }
  >;

export type UseCreatePensionContributionGroup = (
  options?: UseCreatePensionContributionGroupOptions,
) => import('react-query').UseMutationResult<
  CreatePensionContributionGroupData,
  AxiosError<CreatePensionContributionGroupErrorResponse>,
  {
    requestPathParams: CreatePensionContributionGroupPathParams;
    requestBody: CreatePensionContributionGroupBody;
    requestHeaders: CreatePensionContributionGroupHeaders;
  }
>;

// getPensionContributionGroup

export type GetPensionContributionGroupPathParams =
  import('./schema.ts').operations['getPensionContributionGroup']['parameters']['path'];

export type HandlerGetPensionContributionGroupPathParams =
  NormalizeParams<GetPensionContributionGroupPathParams>;

export type GetPensionContributionGroupQuery = never;

export type GetPensionContributionGroupHeaders =
  import('./schema.ts').operations['getPensionContributionGroup']['parameters']['header'];

export type GetPensionContributionGroupBody = never;

export type GetPensionContributionGroupData200 =
  import('./schema.ts').operations['getPensionContributionGroup']['responses'][200]['content']['application/json'];

export type GetPensionContributionGroupData =
  GetPensionContributionGroupData200;

export type GetPensionContributionGroupDataResponse = {
  data: GetPensionContributionGroupData;
};

export type GetPensionContributionGroupErrorResponse = never;

export type GetPensionContributionGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups/:id';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'getPensionContributionGroup';
  };
};

export type GetPensionContributionGroup = (options: {
  pathParams: GetPensionContributionGroupPathParams;
  headers: GetPensionContributionGroupHeaders;
}) => Promise<GetPensionContributionGroupData>;

export type UseGetPensionContributionGroupKey = [
  GetPensionContributionGroupAPI['KEY'],
  GetPensionContributionGroupPathParams,
  GetPensionContributionGroupHeaders,
];

export type UseGetPensionContributionGroupOptions<
  Selection = GetPensionContributionGroupData,
> = import('react-query').UseQueryOptions<
  GetPensionContributionGroupData,
  AxiosError<GetPensionContributionGroupErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseGetPensionContributionGroupKey>
> & {
  select?: (data: GetPensionContributionGroupData) => Selection;
  requestPathParams: GetPensionContributionGroupPathParams;
  requestHeaders: GetPensionContributionGroupHeaders;
};

export type UseGetPensionContributionGroup = <
  Selection = GetPensionContributionGroupData,
>(
  options: UseGetPensionContributionGroupOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetPensionContributionGroupErrorResponse>
>;

// updatePensionContributionGroup

export type UpdatePensionContributionGroupPathParams =
  import('./schema.ts').operations['updatePensionContributionGroup']['parameters']['path'];

export type HandlerUpdatePensionContributionGroupPathParams =
  NormalizeParams<UpdatePensionContributionGroupPathParams>;

export type UpdatePensionContributionGroupQuery = never;

export type UpdatePensionContributionGroupHeaders =
  import('./schema.ts').operations['updatePensionContributionGroup']['parameters']['header'];

export type UpdatePensionContributionGroupBody = NonNullable<
  import('./schema.ts').operations['updatePensionContributionGroup']['requestBody']
>['content']['application/json'];

export type UpdatePensionContributionGroupData200 =
  import('./schema.ts').operations['updatePensionContributionGroup']['responses'][200]['content']['application/json'];

export type UpdatePensionContributionGroupData =
  UpdatePensionContributionGroupData200;

export type UpdatePensionContributionGroupDataResponse = {
  data: UpdatePensionContributionGroupData;
};

export type UpdatePensionContributionGroupErrorResponse = never;

export type UpdatePensionContributionGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups/:id';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updatePensionContributionGroup';
  };
};

export type UpdatePensionContributionGroup = (options: {
  pathParams: UpdatePensionContributionGroupPathParams;
  data: UpdatePensionContributionGroupBody;
  headers: UpdatePensionContributionGroupHeaders;
}) => Promise<UpdatePensionContributionGroupData>;

export type UseUpdatePensionContributionGroupKey = [
  UpdatePensionContributionGroupAPI['KEY'],
];

export type UseUpdatePensionContributionGroupOptions =
  import('react-query').UseMutationOptions<
    UpdatePensionContributionGroupData,
    AxiosError<UpdatePensionContributionGroupErrorResponse>,
    {
      requestPathParams: UpdatePensionContributionGroupPathParams;
      requestBody: UpdatePensionContributionGroupBody;
      requestHeaders: UpdatePensionContributionGroupHeaders;
    }
  >;

export type UseUpdatePensionContributionGroup = (
  options?: UseUpdatePensionContributionGroupOptions,
) => import('react-query').UseMutationResult<
  UpdatePensionContributionGroupData,
  AxiosError<UpdatePensionContributionGroupErrorResponse>,
  {
    requestPathParams: UpdatePensionContributionGroupPathParams;
    requestBody: UpdatePensionContributionGroupBody;
    requestHeaders: UpdatePensionContributionGroupHeaders;
  }
>;

// deletePensionContributionGroup

export type DeletePensionContributionGroupPathParams =
  import('./schema.ts').operations['deletePensionContributionGroup']['parameters']['path'];

export type HandlerDeletePensionContributionGroupPathParams =
  NormalizeParams<DeletePensionContributionGroupPathParams>;

export type DeletePensionContributionGroupQuery = never;

export type DeletePensionContributionGroupHeaders =
  import('./schema.ts').operations['deletePensionContributionGroup']['parameters']['header'];

export type DeletePensionContributionGroupBody = never;

export type DeletePensionContributionGroupData204 = undefined;

export type DeletePensionContributionGroupErrorResponse404 =
  import('./schema.ts').operations['deletePensionContributionGroup']['responses'][404]['content']['application/json'];

export type DeletePensionContributionGroupData =
  DeletePensionContributionGroupData204;

export type DeletePensionContributionGroupDataResponse = {
  data: DeletePensionContributionGroupData;
};

export type DeletePensionContributionGroupErrorResponse =
  DeletePensionContributionGroupErrorResponse404;

export type DeletePensionContributionGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups/:id';
  METHOD: 'DELETE';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'deletePensionContributionGroup';
  };
};

export type DeletePensionContributionGroup = (options: {
  pathParams: DeletePensionContributionGroupPathParams;
  headers: DeletePensionContributionGroupHeaders;
}) => Promise<DeletePensionContributionGroupData>;

export type UseDeletePensionContributionGroupKey = [
  DeletePensionContributionGroupAPI['KEY'],
];

export type UseDeletePensionContributionGroupOptions =
  import('react-query').UseMutationOptions<
    DeletePensionContributionGroupData,
    AxiosError<DeletePensionContributionGroupErrorResponse>,
    {
      requestPathParams: DeletePensionContributionGroupPathParams;
      requestHeaders: DeletePensionContributionGroupHeaders;
    }
  >;

export type UseDeletePensionContributionGroup = (
  options?: UseDeletePensionContributionGroupOptions,
) => import('react-query').UseMutationResult<
  DeletePensionContributionGroupData,
  AxiosError<DeletePensionContributionGroupErrorResponse>,
  {
    requestPathParams: DeletePensionContributionGroupPathParams;
    requestHeaders: DeletePensionContributionGroupHeaders;
  }
>;

// updateEmployerAutoEnrolment

export type UpdateEmployerAutoEnrolmentPathParams = never;

export type HandlerUpdateEmployerAutoEnrolmentPathParams =
  NormalizeParams<UpdateEmployerAutoEnrolmentPathParams>;

export type UpdateEmployerAutoEnrolmentQuery = never;

export type UpdateEmployerAutoEnrolmentHeaders =
  import('./schema.ts').operations['updateEmployerAutoEnrolment']['parameters']['header'];

export type UpdateEmployerAutoEnrolmentBody = NonNullable<
  import('./schema.ts').operations['updateEmployerAutoEnrolment']['requestBody']
>['content']['application/json'];

export type UpdateEmployerAutoEnrolmentData200 =
  import('./schema.ts').operations['updateEmployerAutoEnrolment']['responses'][200]['content']['application/json'];

export type UpdateEmployerAutoEnrolmentData =
  UpdateEmployerAutoEnrolmentData200;

export type UpdateEmployerAutoEnrolmentDataResponse = {
  data: UpdateEmployerAutoEnrolmentData;
};

export type UpdateEmployerAutoEnrolmentErrorResponse = never;

export type UpdateEmployerAutoEnrolmentAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer/auto-enrolment';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateEmployerAutoEnrolment';
  };
};

export type UpdateEmployerAutoEnrolment = (options: {
  data: UpdateEmployerAutoEnrolmentBody;
  headers: UpdateEmployerAutoEnrolmentHeaders;
}) => Promise<UpdateEmployerAutoEnrolmentData>;

export type UseUpdateEmployerAutoEnrolmentKey = [
  UpdateEmployerAutoEnrolmentAPI['KEY'],
];

export type UseUpdateEmployerAutoEnrolmentOptions =
  import('react-query').UseMutationOptions<
    UpdateEmployerAutoEnrolmentData,
    AxiosError<UpdateEmployerAutoEnrolmentErrorResponse>,
    {
      requestBody: UpdateEmployerAutoEnrolmentBody;
      requestHeaders: UpdateEmployerAutoEnrolmentHeaders;
    }
  >;

export type UseUpdateEmployerAutoEnrolment = (
  options?: UseUpdateEmployerAutoEnrolmentOptions,
) => import('react-query').UseMutationResult<
  UpdateEmployerAutoEnrolmentData,
  AxiosError<UpdateEmployerAutoEnrolmentErrorResponse>,
  {
    requestBody: UpdateEmployerAutoEnrolmentBody;
    requestHeaders: UpdateEmployerAutoEnrolmentHeaders;
  }
>;

// getEmployerAutoEnrolment

export type GetEmployerAutoEnrolmentPathParams =
  import('./schema.ts').operations['getEmployerAutoEnrolment']['parameters']['path'];

export type HandlerGetEmployerAutoEnrolmentPathParams =
  NormalizeParams<GetEmployerAutoEnrolmentPathParams>;

export type GetEmployerAutoEnrolmentQuery = never;

export type GetEmployerAutoEnrolmentHeaders =
  import('./schema.ts').operations['getEmployerAutoEnrolment']['parameters']['header'];

export type GetEmployerAutoEnrolmentBody = never;

export type GetEmployerAutoEnrolmentData200 =
  import('./schema.ts').operations['getEmployerAutoEnrolment']['responses'][200]['content']['application/json'];

export type GetEmployerAutoEnrolmentData = GetEmployerAutoEnrolmentData200;

export type GetEmployerAutoEnrolmentDataResponse = {
  data: GetEmployerAutoEnrolmentData;
};

export type GetEmployerAutoEnrolmentErrorResponse = never;

export type GetEmployerAutoEnrolmentAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer/auto-enrolment/:legalEntityId';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'getEmployerAutoEnrolment';
  };
};

export type GetEmployerAutoEnrolment = (options: {
  pathParams: GetEmployerAutoEnrolmentPathParams;
  headers: GetEmployerAutoEnrolmentHeaders;
}) => Promise<GetEmployerAutoEnrolmentData>;

export type UseGetEmployerAutoEnrolmentKey = [
  GetEmployerAutoEnrolmentAPI['KEY'],
  GetEmployerAutoEnrolmentPathParams,
  GetEmployerAutoEnrolmentHeaders,
];

export type UseGetEmployerAutoEnrolmentOptions<
  Selection = GetEmployerAutoEnrolmentData,
> = import('react-query').UseQueryOptions<
  GetEmployerAutoEnrolmentData,
  AxiosError<GetEmployerAutoEnrolmentErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseGetEmployerAutoEnrolmentKey>
> & {
  select?: (data: GetEmployerAutoEnrolmentData) => Selection;
  requestPathParams: GetEmployerAutoEnrolmentPathParams;
  requestHeaders: GetEmployerAutoEnrolmentHeaders;
};

export type UseGetEmployerAutoEnrolment = <
  Selection = GetEmployerAutoEnrolmentData,
>(
  options: UseGetEmployerAutoEnrolmentOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetEmployerAutoEnrolmentErrorResponse>
>;

// listFilings

export type ListFilingsPathParams = never;

export type HandlerListFilingsPathParams =
  NormalizeParams<ListFilingsPathParams>;

export type ListFilingsQuery = never;

export type ListFilingsHeaders =
  import('./schema.ts').operations['listFilings']['parameters']['header'];

export type ListFilingsBody = never;

export type ListFilingsData200 =
  import('./schema.ts').operations['listFilings']['responses'][200]['content']['application/json'];

export type ListFilingsData = ListFilingsData200;

export type ListFilingsDataResponse = { data: ListFilingsData };

export type ListFilingsErrorResponse = never;

export type ListFilingsAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listFilings';
  };
};

export type ListFilings = (options: {
  headers: ListFilingsHeaders;
}) => Promise<ListFilingsData>;

export type UseListFilingsKey = [ListFilingsAPI['KEY'], ListFilingsHeaders];

export type UseListFilingsOptions<Selection = ListFilingsData> =
  import('react-query').UseQueryOptions<
    ListFilingsData,
    AxiosError<ListFilingsErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseListFilingsKey>
  > & {
    select?: (data: ListFilingsData) => Selection;
    requestHeaders: ListFilingsHeaders;
  };

export type UseListFilings = <Selection = ListFilingsData>(
  options: UseListFilingsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListFilingsErrorResponse>
>;

// viewFiling

export type ViewFilingPathParams =
  import('./schema.ts').operations['viewFiling']['parameters']['path'];

export type HandlerViewFilingPathParams = NormalizeParams<ViewFilingPathParams>;

export type ViewFilingQuery = never;

export type ViewFilingHeaders =
  import('./schema.ts').operations['viewFiling']['parameters']['header'];

export type ViewFilingBody = never;

export type ViewFilingData200 =
  import('./schema.ts').operations['viewFiling']['responses'][200]['content']['application/json'];

export type ViewFilingErrorResponse404 =
  import('./schema.ts').operations['viewFiling']['responses'][404]['content']['application/json'];

export type ViewFilingData = ViewFilingData200;

export type ViewFilingDataResponse = { data: ViewFilingData };

export type ViewFilingErrorResponse = ViewFilingErrorResponse404;

export type ViewFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'viewFiling';
  };
};

export type ViewFiling = (options: {
  pathParams: ViewFilingPathParams;
  headers: ViewFilingHeaders;
}) => Promise<ViewFilingData>;

export type UseViewFilingKey = [
  ViewFilingAPI['KEY'],
  ViewFilingPathParams,
  ViewFilingHeaders,
];

export type UseViewFilingOptions<Selection = ViewFilingData> =
  import('react-query').UseQueryOptions<
    ViewFilingData,
    AxiosError<ViewFilingErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseViewFilingKey>
  > & {
    select?: (data: ViewFilingData) => Selection;
    requestPathParams: ViewFilingPathParams;
    requestHeaders: ViewFilingHeaders;
  };

export type UseViewFiling = <Selection = ViewFilingData>(
  options: UseViewFilingOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ViewFilingErrorResponse>
>;

// pollFiling

export type PollFilingPathParams =
  import('./schema.ts').operations['pollFiling']['parameters']['path'];

export type HandlerPollFilingPathParams = NormalizeParams<PollFilingPathParams>;

export type PollFilingQuery = never;

export type PollFilingHeaders =
  import('./schema.ts').operations['pollFiling']['parameters']['header'];

export type PollFilingBody = NonNullable<
  import('./schema.ts').operations['pollFiling']['requestBody']
>['content']['application/json'];

export type PollFilingData200 =
  import('./schema.ts').operations['pollFiling']['responses'][200]['content']['application/json'];

export type PollFilingErrorResponse400 =
  import('./schema.ts').operations['pollFiling']['responses'][400]['content']['application/json'];

export type PollFilingErrorResponse409 =
  import('./schema.ts').operations['pollFiling']['responses'][409]['content']['application/json'];

export type PollFilingData = PollFilingData200;

export type PollFilingDataResponse = { data: PollFilingData };

export type PollFilingErrorResponse =
  | PollFilingErrorResponse400
  | PollFilingErrorResponse409;

export type PollFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id/poll';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'pollFiling';
  };
};

export type PollFiling = (options: {
  pathParams: PollFilingPathParams;
  data: PollFilingBody;
  headers: PollFilingHeaders;
}) => Promise<PollFilingData>;

export type UsePollFilingKey = [PollFilingAPI['KEY']];

export type UsePollFilingOptions = import('react-query').UseMutationOptions<
  PollFilingData,
  AxiosError<PollFilingErrorResponse>,
  {
    requestPathParams: PollFilingPathParams;
    requestBody: PollFilingBody;
    requestHeaders: PollFilingHeaders;
  }
>;

export type UsePollFiling = (
  options?: UsePollFilingOptions,
) => import('react-query').UseMutationResult<
  PollFilingData,
  AxiosError<PollFilingErrorResponse>,
  {
    requestPathParams: PollFilingPathParams;
    requestBody: PollFilingBody;
    requestHeaders: PollFilingHeaders;
  }
>;

// previewFiling

export type PreviewFilingPathParams =
  import('./schema.ts').operations['previewFiling']['parameters']['path'];

export type HandlerPreviewFilingPathParams =
  NormalizeParams<PreviewFilingPathParams>;

export type PreviewFilingQuery = never;

export type PreviewFilingHeaders =
  import('./schema.ts').operations['previewFiling']['parameters']['header'];

export type PreviewFilingBody = NonNullable<
  import('./schema.ts').operations['previewFiling']['requestBody']
>['content']['application/json'];

export type PreviewFilingData200 =
  import('./schema.ts').operations['previewFiling']['responses'][200]['content']['application/xml'];

export type PreviewFilingErrorResponse400 =
  import('./schema.ts').operations['previewFiling']['responses'][400]['content']['application/json'];

export type PreviewFilingErrorResponse409 =
  import('./schema.ts').operations['previewFiling']['responses'][409]['content']['application/json'];

export type PreviewFilingData = PreviewFilingData200;

export type PreviewFilingDataResponse = { data: PreviewFilingData };

export type PreviewFilingErrorResponse =
  | PreviewFilingErrorResponse400
  | PreviewFilingErrorResponse409;

export type PreviewFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id/preview';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'previewFiling';
  };
};

export type PreviewFiling = (options: {
  pathParams: PreviewFilingPathParams;
  data: PreviewFilingBody;
  headers: PreviewFilingHeaders;
}) => Promise<PreviewFilingData>;

export type UsePreviewFilingKey = [PreviewFilingAPI['KEY']];

export type UsePreviewFilingOptions = import('react-query').UseMutationOptions<
  PreviewFilingData,
  AxiosError<PreviewFilingErrorResponse>,
  {
    requestPathParams: PreviewFilingPathParams;
    requestBody: PreviewFilingBody;
    requestHeaders: PreviewFilingHeaders;
  }
>;

export type UsePreviewFiling = (
  options?: UsePreviewFilingOptions,
) => import('react-query').UseMutationResult<
  PreviewFilingData,
  AxiosError<PreviewFilingErrorResponse>,
  {
    requestPathParams: PreviewFilingPathParams;
    requestBody: PreviewFilingBody;
    requestHeaders: PreviewFilingHeaders;
  }
>;

// submitFiling

export type SubmitFilingPathParams =
  import('./schema.ts').operations['submitFiling']['parameters']['path'];

export type HandlerSubmitFilingPathParams =
  NormalizeParams<SubmitFilingPathParams>;

export type SubmitFilingQuery = never;

export type SubmitFilingHeaders =
  import('./schema.ts').operations['submitFiling']['parameters']['header'];

export type SubmitFilingBody = NonNullable<
  import('./schema.ts').operations['submitFiling']['requestBody']
>['content']['application/json'];

export type SubmitFilingData201 =
  import('./schema.ts').operations['submitFiling']['responses'][201]['content']['application/json'];

export type SubmitFilingErrorResponse404 =
  import('./schema.ts').operations['submitFiling']['responses'][404]['content']['application/json'];

export type SubmitFilingErrorResponse409 =
  import('./schema.ts').operations['submitFiling']['responses'][409]['content']['application/json'];

export type SubmitFilingData = SubmitFilingData201;

export type SubmitFilingDataResponse = { data: SubmitFilingData };

export type SubmitFilingErrorResponse =
  | SubmitFilingErrorResponse404
  | SubmitFilingErrorResponse409;

export type SubmitFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id/submit';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'submitFiling';
  };
};

export type SubmitFiling = (options: {
  pathParams: SubmitFilingPathParams;
  data: SubmitFilingBody;
  headers: SubmitFilingHeaders;
}) => Promise<SubmitFilingData>;

export type UseSubmitFilingKey = [SubmitFilingAPI['KEY']];

export type UseSubmitFilingOptions = import('react-query').UseMutationOptions<
  SubmitFilingData,
  AxiosError<SubmitFilingErrorResponse>,
  {
    requestPathParams: SubmitFilingPathParams;
    requestBody: SubmitFilingBody;
    requestHeaders: SubmitFilingHeaders;
  }
>;

export type UseSubmitFiling = (
  options?: UseSubmitFilingOptions,
) => import('react-query').UseMutationResult<
  SubmitFilingData,
  AxiosError<SubmitFilingErrorResponse>,
  {
    requestPathParams: SubmitFilingPathParams;
    requestBody: SubmitFilingBody;
    requestHeaders: SubmitFilingHeaders;
  }
>;

// fetchLegalEntityData

export type FetchLegalEntityDataPathParams =
  import('./schema.ts').operations['fetchLegalEntityData']['parameters']['path'];

export type HandlerFetchLegalEntityDataPathParams =
  NormalizeParams<FetchLegalEntityDataPathParams>;

export type FetchLegalEntityDataQuery = never;

export type FetchLegalEntityDataHeaders =
  import('./schema.ts').operations['fetchLegalEntityData']['parameters']['header'];

export type FetchLegalEntityDataBody = never;

export type FetchLegalEntityDataData200 =
  import('./schema.ts').operations['fetchLegalEntityData']['responses'][200]['content']['application/json'];

export type FetchLegalEntityDataErrorResponse403 =
  import('./schema.ts').operations['fetchLegalEntityData']['responses'][403]['content']['application/json'];

export type FetchLegalEntityDataErrorResponse500 =
  import('./schema.ts').operations['fetchLegalEntityData']['responses'][500]['content']['application/json'];

export type FetchLegalEntityDataData = FetchLegalEntityDataData200;

export type FetchLegalEntityDataDataResponse = {
  data: FetchLegalEntityDataData;
};

export type FetchLegalEntityDataErrorResponse =
  | FetchLegalEntityDataErrorResponse403
  | FetchLegalEntityDataErrorResponse500;

export type FetchLegalEntityDataAPI = {
  API_PATH: '/public/athena/v1/payrollme/legal-entities/:legalEntityId';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'fetchLegalEntityData';
  };
};

export type FetchLegalEntityData = (options: {
  pathParams: FetchLegalEntityDataPathParams;
  headers: FetchLegalEntityDataHeaders;
}) => Promise<FetchLegalEntityDataData>;

export type UseFetchLegalEntityDataKey = [
  FetchLegalEntityDataAPI['KEY'],
  FetchLegalEntityDataPathParams,
  FetchLegalEntityDataHeaders,
];

export type UseFetchLegalEntityDataOptions<
  Selection = FetchLegalEntityDataData,
> = import('react-query').UseQueryOptions<
  FetchLegalEntityDataData,
  AxiosError<FetchLegalEntityDataErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseFetchLegalEntityDataKey>
> & {
  select?: (data: FetchLegalEntityDataData) => Selection;
  requestPathParams: FetchLegalEntityDataPathParams;
  requestHeaders: FetchLegalEntityDataHeaders;
};

export type UseFetchLegalEntityData = <Selection = FetchLegalEntityDataData>(
  options: UseFetchLegalEntityDataOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<FetchLegalEntityDataErrorResponse>
>;

// updateLegalEntityData

export type UpdateLegalEntityDataPathParams =
  import('./schema.ts').operations['updateLegalEntityData']['parameters']['path'];

export type HandlerUpdateLegalEntityDataPathParams =
  NormalizeParams<UpdateLegalEntityDataPathParams>;

export type UpdateLegalEntityDataQuery = never;

export type UpdateLegalEntityDataHeaders =
  import('./schema.ts').operations['updateLegalEntityData']['parameters']['header'];

export type UpdateLegalEntityDataBody = NonNullable<
  import('./schema.ts').operations['updateLegalEntityData']['requestBody']
>['content']['application/json'];

export type UpdateLegalEntityDataData204 =
  import('./schema.ts').operations['updateLegalEntityData']['responses'][204]['content']['application/json'];

export type UpdateLegalEntityDataErrorResponse400 =
  import('./schema.ts').operations['updateLegalEntityData']['responses'][400]['content']['application/json'];

export type UpdateLegalEntityDataData = UpdateLegalEntityDataData204;

export type UpdateLegalEntityDataDataResponse = {
  data: UpdateLegalEntityDataData;
};

export type UpdateLegalEntityDataErrorResponse =
  UpdateLegalEntityDataErrorResponse400;

export type UpdateLegalEntityDataAPI = {
  API_PATH: '/public/athena/v1/payrollme/legal-entities/:legalEntityId';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateLegalEntityData';
  };
};

export type UpdateLegalEntityData = (options: {
  pathParams: UpdateLegalEntityDataPathParams;
  data: UpdateLegalEntityDataBody;
  headers: UpdateLegalEntityDataHeaders;
}) => Promise<UpdateLegalEntityDataData>;

export type UseUpdateLegalEntityDataKey = [UpdateLegalEntityDataAPI['KEY']];

export type UseUpdateLegalEntityDataOptions =
  import('react-query').UseMutationOptions<
    UpdateLegalEntityDataData,
    AxiosError<UpdateLegalEntityDataErrorResponse>,
    {
      requestPathParams: UpdateLegalEntityDataPathParams;
      requestBody: UpdateLegalEntityDataBody;
      requestHeaders: UpdateLegalEntityDataHeaders;
    }
  >;

export type UseUpdateLegalEntityData = (
  options?: UseUpdateLegalEntityDataOptions,
) => import('react-query').UseMutationResult<
  UpdateLegalEntityDataData,
  AxiosError<UpdateLegalEntityDataErrorResponse>,
  {
    requestPathParams: UpdateLegalEntityDataPathParams;
    requestBody: UpdateLegalEntityDataBody;
    requestHeaders: UpdateLegalEntityDataHeaders;
  }
>;

// listPayGroups

export type ListPayGroupsPathParams = never;

export type HandlerListPayGroupsPathParams =
  NormalizeParams<ListPayGroupsPathParams>;

export type ListPayGroupsQuery = never;

export type ListPayGroupsHeaders =
  import('./schema.ts').operations['listPayGroups']['parameters']['header'];

export type ListPayGroupsBody = never;

export type ListPayGroupsData200 =
  import('./schema.ts').operations['listPayGroups']['responses'][200]['content']['application/json'];

export type ListPayGroupsData = ListPayGroupsData200;

export type ListPayGroupsDataResponse = { data: ListPayGroupsData };

export type ListPayGroupsErrorResponse = never;

export type ListPayGroupsAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listPayGroups';
  };
};

export type ListPayGroups = (options: {
  headers: ListPayGroupsHeaders;
}) => Promise<ListPayGroupsData>;

export type UseListPayGroupsKey = [
  ListPayGroupsAPI['KEY'],
  ListPayGroupsHeaders,
];

export type UseListPayGroupsOptions<Selection = ListPayGroupsData> =
  import('react-query').UseQueryOptions<
    ListPayGroupsData,
    AxiosError<ListPayGroupsErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseListPayGroupsKey>
  > & {
    select?: (data: ListPayGroupsData) => Selection;
    requestHeaders: ListPayGroupsHeaders;
  };

export type UseListPayGroups = <Selection = ListPayGroupsData>(
  options: UseListPayGroupsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListPayGroupsErrorResponse>
>;

// createPayGroup

export type CreatePayGroupPathParams = never;

export type HandlerCreatePayGroupPathParams =
  NormalizeParams<CreatePayGroupPathParams>;

export type CreatePayGroupQuery = never;

export type CreatePayGroupHeaders =
  import('./schema.ts').operations['createPayGroup']['parameters']['header'];

export type CreatePayGroupBody = NonNullable<
  import('./schema.ts').operations['createPayGroup']['requestBody']
>['content']['application/json'];

export type CreatePayGroupData201 =
  import('./schema.ts').operations['createPayGroup']['responses'][201]['content']['application/json'];

export type CreatePayGroupErrorResponse409 =
  import('./schema.ts').operations['createPayGroup']['responses'][409]['content']['application/json'];

export type CreatePayGroupErrorResponse501 =
  import('./schema.ts').operations['createPayGroup']['responses'][501]['content']['application/json'];

export type CreatePayGroupData = CreatePayGroupData201;

export type CreatePayGroupDataResponse = { data: CreatePayGroupData };

export type CreatePayGroupErrorResponse =
  | CreatePayGroupErrorResponse409
  | CreatePayGroupErrorResponse501;

export type CreatePayGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createPayGroup';
  };
};

export type CreatePayGroup = (options: {
  data: CreatePayGroupBody;
  headers: CreatePayGroupHeaders;
}) => Promise<CreatePayGroupData>;

export type UseCreatePayGroupKey = [CreatePayGroupAPI['KEY']];

export type UseCreatePayGroupOptions = import('react-query').UseMutationOptions<
  CreatePayGroupData,
  AxiosError<CreatePayGroupErrorResponse>,
  { requestBody: CreatePayGroupBody; requestHeaders: CreatePayGroupHeaders }
>;

export type UseCreatePayGroup = (
  options?: UseCreatePayGroupOptions,
) => import('react-query').UseMutationResult<
  CreatePayGroupData,
  AxiosError<CreatePayGroupErrorResponse>,
  { requestBody: CreatePayGroupBody; requestHeaders: CreatePayGroupHeaders }
>;

// retrievePayGroup

export type RetrievePayGroupPathParams =
  import('./schema.ts').operations['retrievePayGroup']['parameters']['path'];

export type HandlerRetrievePayGroupPathParams =
  NormalizeParams<RetrievePayGroupPathParams>;

export type RetrievePayGroupQuery = never;

export type RetrievePayGroupHeaders =
  import('./schema.ts').operations['retrievePayGroup']['parameters']['header'];

export type RetrievePayGroupBody = never;

export type RetrievePayGroupData200 =
  import('./schema.ts').operations['retrievePayGroup']['responses'][200]['content']['application/json'];

export type RetrievePayGroupData = RetrievePayGroupData200;

export type RetrievePayGroupDataResponse = { data: RetrievePayGroupData };

export type RetrievePayGroupErrorResponse = never;

export type RetrievePayGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group/:id';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'retrievePayGroup';
  };
};

export type RetrievePayGroup = (options: {
  pathParams: RetrievePayGroupPathParams;
  headers: RetrievePayGroupHeaders;
}) => Promise<RetrievePayGroupData>;

export type UseRetrievePayGroupKey = [
  RetrievePayGroupAPI['KEY'],
  RetrievePayGroupPathParams,
  RetrievePayGroupHeaders,
];

export type UseRetrievePayGroupOptions<Selection = RetrievePayGroupData> =
  import('react-query').UseQueryOptions<
    RetrievePayGroupData,
    AxiosError<RetrievePayGroupErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseRetrievePayGroupKey>
  > & {
    select?: (data: RetrievePayGroupData) => Selection;
    requestPathParams: RetrievePayGroupPathParams;
    requestHeaders: RetrievePayGroupHeaders;
  };

export type UseRetrievePayGroup = <Selection = RetrievePayGroupData>(
  options: UseRetrievePayGroupOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<RetrievePayGroupErrorResponse>
>;

// deletePayGroup

export type DeletePayGroupPathParams =
  import('./schema.ts').operations['deletePayGroup']['parameters']['path'];

export type HandlerDeletePayGroupPathParams =
  NormalizeParams<DeletePayGroupPathParams>;

export type DeletePayGroupQuery = never;

export type DeletePayGroupHeaders =
  import('./schema.ts').operations['deletePayGroup']['parameters']['header'];

export type DeletePayGroupBody = never;

export type DeletePayGroupData204 = undefined;

export type DeletePayGroupErrorResponse501 =
  import('./schema.ts').operations['deletePayGroup']['responses'][501]['content']['application/json'];

export type DeletePayGroupData = DeletePayGroupData204;

export type DeletePayGroupDataResponse = { data: DeletePayGroupData };

export type DeletePayGroupErrorResponse = DeletePayGroupErrorResponse501;

export type DeletePayGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group/:id';
  METHOD: 'DELETE';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'deletePayGroup';
  };
};

export type DeletePayGroup = (options: {
  pathParams: DeletePayGroupPathParams;
  headers: DeletePayGroupHeaders;
}) => Promise<DeletePayGroupData>;

export type UseDeletePayGroupKey = [DeletePayGroupAPI['KEY']];

export type UseDeletePayGroupOptions = import('react-query').UseMutationOptions<
  DeletePayGroupData,
  AxiosError<DeletePayGroupErrorResponse>,
  {
    requestPathParams: DeletePayGroupPathParams;
    requestHeaders: DeletePayGroupHeaders;
  }
>;

export type UseDeletePayGroup = (
  options?: UseDeletePayGroupOptions,
) => import('react-query').UseMutationResult<
  DeletePayGroupData,
  AxiosError<DeletePayGroupErrorResponse>,
  {
    requestPathParams: DeletePayGroupPathParams;
    requestHeaders: DeletePayGroupHeaders;
  }
>;

// createPayrollRun

export type CreatePayrollRunPathParams = never;

export type HandlerCreatePayrollRunPathParams =
  NormalizeParams<CreatePayrollRunPathParams>;

export type CreatePayrollRunQuery = never;

export type CreatePayrollRunHeaders =
  import('./schema.ts').operations['createPayrollRun']['parameters']['header'];

export type CreatePayrollRunBody = NonNullable<
  import('./schema.ts').operations['createPayrollRun']['requestBody']
>['content']['application/json'];

export type CreatePayrollRunData201 =
  import('./schema.ts').operations['createPayrollRun']['responses'][201]['content']['application/json'];

export type CreatePayrollRunErrorResponse400 =
  import('./schema.ts').operations['createPayrollRun']['responses'][400]['content']['application/json'];

export type CreatePayrollRunData = CreatePayrollRunData201;

export type CreatePayrollRunDataResponse = { data: CreatePayrollRunData };

export type CreatePayrollRunErrorResponse = CreatePayrollRunErrorResponse400;

export type CreatePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createPayrollRun';
  };
};

export type CreatePayrollRun = (options: {
  data: CreatePayrollRunBody;
  headers: CreatePayrollRunHeaders;
}) => Promise<CreatePayrollRunData>;

export type UseCreatePayrollRunKey = [CreatePayrollRunAPI['KEY']];

export type UseCreatePayrollRunOptions =
  import('react-query').UseMutationOptions<
    CreatePayrollRunData,
    AxiosError<CreatePayrollRunErrorResponse>,
    {
      requestBody: CreatePayrollRunBody;
      requestHeaders: CreatePayrollRunHeaders;
    }
  >;

export type UseCreatePayrollRun = (
  options?: UseCreatePayrollRunOptions,
) => import('react-query').UseMutationResult<
  CreatePayrollRunData,
  AxiosError<CreatePayrollRunErrorResponse>,
  { requestBody: CreatePayrollRunBody; requestHeaders: CreatePayrollRunHeaders }
>;

// retrievePayrollRun

export type RetrievePayrollRunPathParams =
  import('./schema.ts').operations['retrievePayrollRun']['parameters']['path'];

export type HandlerRetrievePayrollRunPathParams =
  NormalizeParams<RetrievePayrollRunPathParams>;

export type RetrievePayrollRunQuery = never;

export type RetrievePayrollRunHeaders =
  import('./schema.ts').operations['retrievePayrollRun']['parameters']['header'];

export type RetrievePayrollRunBody = never;

export type RetrievePayrollRunData200 =
  import('./schema.ts').operations['retrievePayrollRun']['responses'][200]['content']['application/json'];

export type RetrievePayrollRunErrorResponse400 =
  import('./schema.ts').operations['retrievePayrollRun']['responses'][400]['content']['application/json'];

export type RetrievePayrollRunData = RetrievePayrollRunData200;

export type RetrievePayrollRunDataResponse = { data: RetrievePayrollRunData };

export type RetrievePayrollRunErrorResponse =
  RetrievePayrollRunErrorResponse400;

export type RetrievePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'retrievePayrollRun';
  };
};

export type RetrievePayrollRun = (options: {
  pathParams: RetrievePayrollRunPathParams;
  headers: RetrievePayrollRunHeaders;
}) => Promise<RetrievePayrollRunData>;

export type UseRetrievePayrollRunKey = [
  RetrievePayrollRunAPI['KEY'],
  RetrievePayrollRunPathParams,
  RetrievePayrollRunHeaders,
];

export type UseRetrievePayrollRunOptions<Selection = RetrievePayrollRunData> =
  import('react-query').UseQueryOptions<
    RetrievePayrollRunData,
    AxiosError<RetrievePayrollRunErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseRetrievePayrollRunKey>
  > & {
    select?: (data: RetrievePayrollRunData) => Selection;
    requestPathParams: RetrievePayrollRunPathParams;
    requestHeaders: RetrievePayrollRunHeaders;
  };

export type UseRetrievePayrollRun = <Selection = RetrievePayrollRunData>(
  options: UseRetrievePayrollRunOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<RetrievePayrollRunErrorResponse>
>;

// updatePayrollRun

export type UpdatePayrollRunPathParams =
  import('./schema.ts').operations['updatePayrollRun']['parameters']['path'];

export type HandlerUpdatePayrollRunPathParams =
  NormalizeParams<UpdatePayrollRunPathParams>;

export type UpdatePayrollRunQuery = never;

export type UpdatePayrollRunHeaders =
  import('./schema.ts').operations['updatePayrollRun']['parameters']['header'];

export type UpdatePayrollRunBody = NonNullable<
  import('./schema.ts').operations['updatePayrollRun']['requestBody']
>['content']['application/json'];

export type UpdatePayrollRunData200 =
  import('./schema.ts').operations['updatePayrollRun']['responses'][200]['content']['application/json'];

export type UpdatePayrollRunErrorResponse400 =
  import('./schema.ts').operations['updatePayrollRun']['responses'][400]['content']['application/json'];

export type UpdatePayrollRunData = UpdatePayrollRunData200;

export type UpdatePayrollRunDataResponse = { data: UpdatePayrollRunData };

export type UpdatePayrollRunErrorResponse = UpdatePayrollRunErrorResponse400;

export type UpdatePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updatePayrollRun';
  };
};

export type UpdatePayrollRun = (options: {
  pathParams: UpdatePayrollRunPathParams;
  data: UpdatePayrollRunBody;
  headers: UpdatePayrollRunHeaders;
}) => Promise<UpdatePayrollRunData>;

export type UseUpdatePayrollRunKey = [UpdatePayrollRunAPI['KEY']];

export type UseUpdatePayrollRunOptions =
  import('react-query').UseMutationOptions<
    UpdatePayrollRunData,
    AxiosError<UpdatePayrollRunErrorResponse>,
    {
      requestPathParams: UpdatePayrollRunPathParams;
      requestBody: UpdatePayrollRunBody;
      requestHeaders: UpdatePayrollRunHeaders;
    }
  >;

export type UseUpdatePayrollRun = (
  options?: UseUpdatePayrollRunOptions,
) => import('react-query').UseMutationResult<
  UpdatePayrollRunData,
  AxiosError<UpdatePayrollRunErrorResponse>,
  {
    requestPathParams: UpdatePayrollRunPathParams;
    requestBody: UpdatePayrollRunBody;
    requestHeaders: UpdatePayrollRunHeaders;
  }
>;

// approvePayrollRun

export type ApprovePayrollRunPathParams =
  import('./schema.ts').operations['approvePayrollRun']['parameters']['path'];

export type HandlerApprovePayrollRunPathParams =
  NormalizeParams<ApprovePayrollRunPathParams>;

export type ApprovePayrollRunQuery = never;

export type ApprovePayrollRunHeaders =
  import('./schema.ts').operations['approvePayrollRun']['parameters']['header'];

export type ApprovePayrollRunBody = never;

export type ApprovePayrollRunData200 =
  import('./schema.ts').operations['approvePayrollRun']['responses'][200]['content']['application/json'];

export type ApprovePayrollRunErrorResponse400 =
  import('./schema.ts').operations['approvePayrollRun']['responses'][400]['content']['application/json'];

export type ApprovePayrollRunData = ApprovePayrollRunData200;

export type ApprovePayrollRunDataResponse = { data: ApprovePayrollRunData };

export type ApprovePayrollRunErrorResponse = ApprovePayrollRunErrorResponse400;

export type ApprovePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id/approve';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'approvePayrollRun';
  };
};

export type ApprovePayrollRun = (options: {
  pathParams: ApprovePayrollRunPathParams;
  headers: ApprovePayrollRunHeaders;
}) => Promise<ApprovePayrollRunData>;

export type UseApprovePayrollRunKey = [ApprovePayrollRunAPI['KEY']];

export type UseApprovePayrollRunOptions =
  import('react-query').UseMutationOptions<
    ApprovePayrollRunData,
    AxiosError<ApprovePayrollRunErrorResponse>,
    {
      requestPathParams: ApprovePayrollRunPathParams;
      requestHeaders: ApprovePayrollRunHeaders;
    }
  >;

export type UseApprovePayrollRun = (
  options?: UseApprovePayrollRunOptions,
) => import('react-query').UseMutationResult<
  ApprovePayrollRunData,
  AxiosError<ApprovePayrollRunErrorResponse>,
  {
    requestPathParams: ApprovePayrollRunPathParams;
    requestHeaders: ApprovePayrollRunHeaders;
  }
>;

// previewPayrollRunFPS

export type PreviewPayrollRunFPSPathParams =
  import('./schema.ts').operations['previewPayrollRunFPS']['parameters']['path'];

export type HandlerPreviewPayrollRunFPSPathParams =
  NormalizeParams<PreviewPayrollRunFPSPathParams>;

export type PreviewPayrollRunFPSQuery = never;

export type PreviewPayrollRunFPSHeaders =
  import('./schema.ts').operations['previewPayrollRunFPS']['parameters']['header'];

export type PreviewPayrollRunFPSBody = NonNullable<
  import('./schema.ts').operations['previewPayrollRunFPS']['requestBody']
>['content']['application/json'];

export type PreviewPayrollRunFPSData201 =
  import('./schema.ts').operations['previewPayrollRunFPS']['responses'][201]['content']['application/xml'];

export type PreviewPayrollRunFPSErrorResponse400 =
  import('./schema.ts').operations['previewPayrollRunFPS']['responses'][400]['content']['application/xml'];

export type PreviewPayrollRunFPSData = PreviewPayrollRunFPSData201;

export type PreviewPayrollRunFPSDataResponse = {
  data: PreviewPayrollRunFPSData;
};

export type PreviewPayrollRunFPSErrorResponse =
  PreviewPayrollRunFPSErrorResponse400;

export type PreviewPayrollRunFPSAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id/preview-fps';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'previewPayrollRunFPS';
  };
};

export type PreviewPayrollRunFPS = (options: {
  pathParams: PreviewPayrollRunFPSPathParams;
  data: PreviewPayrollRunFPSBody;
  headers: PreviewPayrollRunFPSHeaders;
}) => Promise<PreviewPayrollRunFPSData>;

export type UsePreviewPayrollRunFPSKey = [PreviewPayrollRunFPSAPI['KEY']];

export type UsePreviewPayrollRunFPSOptions =
  import('react-query').UseMutationOptions<
    PreviewPayrollRunFPSData,
    AxiosError<PreviewPayrollRunFPSErrorResponse>,
    {
      requestPathParams: PreviewPayrollRunFPSPathParams;
      requestBody: PreviewPayrollRunFPSBody;
      requestHeaders: PreviewPayrollRunFPSHeaders;
    }
  >;

export type UsePreviewPayrollRunFPS = (
  options?: UsePreviewPayrollRunFPSOptions,
) => import('react-query').UseMutationResult<
  PreviewPayrollRunFPSData,
  AxiosError<PreviewPayrollRunFPSErrorResponse>,
  {
    requestPathParams: PreviewPayrollRunFPSPathParams;
    requestBody: PreviewPayrollRunFPSBody;
    requestHeaders: PreviewPayrollRunFPSHeaders;
  }
>;

// retrieveBacsFileForPayrollRun

export type RetrieveBacsFileForPayrollRunPathParams =
  import('./schema.ts').operations['retrieveBacsFileForPayrollRun']['parameters']['path'];

export type HandlerRetrieveBacsFileForPayrollRunPathParams =
  NormalizeParams<RetrieveBacsFileForPayrollRunPathParams>;

export type RetrieveBacsFileForPayrollRunQuery = never;

export type RetrieveBacsFileForPayrollRunHeaders =
  import('./schema.ts').operations['retrieveBacsFileForPayrollRun']['parameters']['header'];

export type RetrieveBacsFileForPayrollRunBody = NonNullable<
  import('./schema.ts').operations['retrieveBacsFileForPayrollRun']['requestBody']
>['content']['application/json'];

export type RetrieveBacsFileForPayrollRunData200 =
  import('./schema.ts').operations['retrieveBacsFileForPayrollRun']['responses'][200]['content']['application/json'];

export type RetrieveBacsFileForPayrollRunData =
  RetrieveBacsFileForPayrollRunData200;

export type RetrieveBacsFileForPayrollRunDataResponse = {
  data: RetrieveBacsFileForPayrollRunData;
};

export type RetrieveBacsFileForPayrollRunErrorResponse = never;

export type RetrieveBacsFileForPayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:payrollRunId/bacs';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'retrieveBacsFileForPayrollRun';
  };
};

export type RetrieveBacsFileForPayrollRun = (options: {
  pathParams: RetrieveBacsFileForPayrollRunPathParams;
  data: RetrieveBacsFileForPayrollRunBody;
  headers: RetrieveBacsFileForPayrollRunHeaders;
}) => Promise<RetrieveBacsFileForPayrollRunData>;

export type UseRetrieveBacsFileForPayrollRunKey = [
  RetrieveBacsFileForPayrollRunAPI['KEY'],
];

export type UseRetrieveBacsFileForPayrollRunOptions =
  import('react-query').UseMutationOptions<
    RetrieveBacsFileForPayrollRunData,
    AxiosError<RetrieveBacsFileForPayrollRunErrorResponse>,
    {
      requestPathParams: RetrieveBacsFileForPayrollRunPathParams;
      requestBody: RetrieveBacsFileForPayrollRunBody;
      requestHeaders: RetrieveBacsFileForPayrollRunHeaders;
    }
  >;

export type UseRetrieveBacsFileForPayrollRun = (
  options?: UseRetrieveBacsFileForPayrollRunOptions,
) => import('react-query').UseMutationResult<
  RetrieveBacsFileForPayrollRunData,
  AxiosError<RetrieveBacsFileForPayrollRunErrorResponse>,
  {
    requestPathParams: RetrieveBacsFileForPayrollRunPathParams;
    requestBody: RetrieveBacsFileForPayrollRunBody;
    requestHeaders: RetrieveBacsFileForPayrollRunHeaders;
  }
>;

// listPayrollRuns

export type ListPayrollRunsPathParams = never;

export type HandlerListPayrollRunsPathParams =
  NormalizeParams<ListPayrollRunsPathParams>;

export type ListPayrollRunsQuery =
  import('./schema.ts').operations['listPayrollRuns']['parameters']['query'];

export type ListPayrollRunsHeaders =
  import('./schema.ts').operations['listPayrollRuns']['parameters']['header'];

export type ListPayrollRunsBody = never;

export type ListPayrollRunsData200 =
  import('./schema.ts').operations['listPayrollRuns']['responses'][200]['content']['application/json'];

export type ListPayrollRunsErrorResponse400 =
  import('./schema.ts').operations['listPayrollRuns']['responses'][400]['content']['application/json'];

export type ListPayrollRunsData = ListPayrollRunsData200;

export type ListPayrollRunsDataResponse = { data: ListPayrollRunsData };

export type ListPayrollRunsErrorResponse = ListPayrollRunsErrorResponse400;

export type ListPayrollRunsAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-runs';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listPayrollRuns';
  };
};

export type ListPayrollRuns = (options: {
  params: ListPayrollRunsQuery;
  headers: ListPayrollRunsHeaders;
}) => Promise<ListPayrollRunsData>;

export type UseListPayrollRunsKey = [
  ListPayrollRunsAPI['KEY'],
  ListPayrollRunsQuery,
  ListPayrollRunsHeaders,
];

export type UseListPayrollRunsOptions<Selection = ListPayrollRunsData> =
  import('react-query').UseQueryOptions<
    ListPayrollRunsData,
    AxiosError<ListPayrollRunsErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseListPayrollRunsKey>
  > & {
    select?: (data: ListPayrollRunsData) => Selection;
    requestQuery: ListPayrollRunsQuery;
    requestHeaders: ListPayrollRunsHeaders;
  };

export type UseListPayrollRuns = <Selection = ListPayrollRunsData>(
  options: UseListPayrollRunsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListPayrollRunsErrorResponse>
>;

// listCompensationTypes

export type ListCompensationTypesPathParams = never;

export type HandlerListCompensationTypesPathParams =
  NormalizeParams<ListCompensationTypesPathParams>;

export type ListCompensationTypesQuery = never;

export type ListCompensationTypesHeaders =
  import('./schema.ts').operations['listCompensationTypes']['parameters']['header'];

export type ListCompensationTypesBody = never;

export type ListCompensationTypesData200 =
  import('./schema.ts').operations['listCompensationTypes']['responses'][200]['content']['application/json'];

export type ListCompensationTypesErrorResponse404 =
  import('./schema.ts').operations['listCompensationTypes']['responses'][404]['content']['application/json'];

export type ListCompensationTypesData = ListCompensationTypesData200;

export type ListCompensationTypesDataResponse = {
  data: ListCompensationTypesData;
};

export type ListCompensationTypesErrorResponse =
  ListCompensationTypesErrorResponse404;

export type ListCompensationTypesAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/compensation-types';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listCompensationTypes';
  };
};

export type ListCompensationTypes = (options: {
  headers: ListCompensationTypesHeaders;
}) => Promise<ListCompensationTypesData>;

export type UseListCompensationTypesKey = [
  ListCompensationTypesAPI['KEY'],
  ListCompensationTypesHeaders,
];

export type UseListCompensationTypesOptions<
  Selection = ListCompensationTypesData,
> = import('react-query').UseQueryOptions<
  ListCompensationTypesData,
  AxiosError<ListCompensationTypesErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListCompensationTypesKey>
> & {
  select?: (data: ListCompensationTypesData) => Selection;
  requestHeaders: ListCompensationTypesHeaders;
};

export type UseListCompensationTypes = <Selection = ListCompensationTypesData>(
  options: UseListCompensationTypesOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListCompensationTypesErrorResponse>
>;

// createDefaultSchemas

export type CreateDefaultSchemasPathParams = never;

export type HandlerCreateDefaultSchemasPathParams =
  NormalizeParams<CreateDefaultSchemasPathParams>;

export type CreateDefaultSchemasQuery =
  import('./schema.ts').operations['createDefaultSchemas']['parameters']['query'];

export type CreateDefaultSchemasHeaders =
  import('./schema.ts').operations['createDefaultSchemas']['parameters']['header'];

export type CreateDefaultSchemasBody = never;

export type CreateDefaultSchemasData204 =
  import('./schema.ts').operations['createDefaultSchemas']['responses'][204]['content']['application/json'];

export type CreateDefaultSchemasErrorResponse409 =
  import('./schema.ts').operations['createDefaultSchemas']['responses'][409]['content']['application/json'];

export type CreateDefaultSchemasData = CreateDefaultSchemasData204;

export type CreateDefaultSchemasDataResponse = {
  data: CreateDefaultSchemasData;
};

export type CreateDefaultSchemasErrorResponse =
  CreateDefaultSchemasErrorResponse409;

export type CreateDefaultSchemasAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/create-default-employer-schemas';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createDefaultSchemas';
  };
};

export type CreateDefaultSchemas = (options: {
  params: CreateDefaultSchemasQuery;
  headers: CreateDefaultSchemasHeaders;
}) => Promise<CreateDefaultSchemasData>;

export type UseCreateDefaultSchemasKey = [CreateDefaultSchemasAPI['KEY']];

export type UseCreateDefaultSchemasOptions =
  import('react-query').UseMutationOptions<
    CreateDefaultSchemasData,
    AxiosError<CreateDefaultSchemasErrorResponse>,
    {
      requestQuery: CreateDefaultSchemasQuery;
      requestHeaders: CreateDefaultSchemasHeaders;
    }
  >;

export type UseCreateDefaultSchemas = (
  options?: UseCreateDefaultSchemasOptions,
) => import('react-query').UseMutationResult<
  CreateDefaultSchemasData,
  AxiosError<CreateDefaultSchemasErrorResponse>,
  {
    requestQuery: CreateDefaultSchemasQuery;
    requestHeaders: CreateDefaultSchemasHeaders;
  }
>;

// listEmployerCompensationSchemas

export type ListEmployerCompensationSchemasPathParams = never;

export type HandlerListEmployerCompensationSchemasPathParams =
  NormalizeParams<ListEmployerCompensationSchemasPathParams>;

export type ListEmployerCompensationSchemasQuery =
  import('./schema.ts').operations['listEmployerCompensationSchemas']['parameters']['query'];

export type ListEmployerCompensationSchemasHeaders =
  import('./schema.ts').operations['listEmployerCompensationSchemas']['parameters']['header'];

export type ListEmployerCompensationSchemasBody = never;

export type ListEmployerCompensationSchemasData200 =
  import('./schema.ts').operations['listEmployerCompensationSchemas']['responses'][200]['content']['application/json'];

export type ListEmployerCompensationSchemasData =
  ListEmployerCompensationSchemasData200;

export type ListEmployerCompensationSchemasDataResponse = {
  data: ListEmployerCompensationSchemasData;
};

export type ListEmployerCompensationSchemasErrorResponse = never;

export type ListEmployerCompensationSchemasAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-compensation-schema';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listEmployerCompensationSchemas';
  };
};

export type ListEmployerCompensationSchemas = (options: {
  params: ListEmployerCompensationSchemasQuery;
  headers: ListEmployerCompensationSchemasHeaders;
}) => Promise<ListEmployerCompensationSchemasData>;

export type UseListEmployerCompensationSchemasKey = [
  ListEmployerCompensationSchemasAPI['KEY'],
  ListEmployerCompensationSchemasQuery,
  ListEmployerCompensationSchemasHeaders,
];

export type UseListEmployerCompensationSchemasOptions<
  Selection = ListEmployerCompensationSchemasData,
> = import('react-query').UseQueryOptions<
  ListEmployerCompensationSchemasData,
  AxiosError<ListEmployerCompensationSchemasErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListEmployerCompensationSchemasKey>
> & {
  select?: (data: ListEmployerCompensationSchemasData) => Selection;
  requestQuery: ListEmployerCompensationSchemasQuery;
  requestHeaders: ListEmployerCompensationSchemasHeaders;
};

export type UseListEmployerCompensationSchemas = <
  Selection = ListEmployerCompensationSchemasData,
>(
  options: UseListEmployerCompensationSchemasOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListEmployerCompensationSchemasErrorResponse>
>;

// createCompensation

export type CreateCompensationPathParams = never;

export type HandlerCreateCompensationPathParams =
  NormalizeParams<CreateCompensationPathParams>;

export type CreateCompensationQuery = never;

export type CreateCompensationHeaders =
  import('./schema.ts').operations['createCompensation']['parameters']['header'];

export type CreateCompensationBody = NonNullable<
  import('./schema.ts').operations['createCompensation']['requestBody']
>['content']['application/json'];

export type CreateCompensationData201 =
  import('./schema.ts').operations['createCompensation']['responses'][201]['content']['application/json'];

export type CreateCompensationErrorResponse400 =
  import('./schema.ts').operations['createCompensation']['responses'][400]['content']['application/json'];

export type CreateCompensationErrorResponse409 =
  import('./schema.ts').operations['createCompensation']['responses'][409]['content']['application/json'];

export type CreateCompensationData = CreateCompensationData201;

export type CreateCompensationDataResponse = { data: CreateCompensationData };

export type CreateCompensationErrorResponse =
  | CreateCompensationErrorResponse400
  | CreateCompensationErrorResponse409;

export type CreateCompensationAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-compensation-schema';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createCompensation';
  };
};

export type CreateCompensation = (options: {
  data: CreateCompensationBody;
  headers: CreateCompensationHeaders;
}) => Promise<CreateCompensationData>;

export type UseCreateCompensationKey = [CreateCompensationAPI['KEY']];

export type UseCreateCompensationOptions =
  import('react-query').UseMutationOptions<
    CreateCompensationData,
    AxiosError<CreateCompensationErrorResponse>,
    {
      requestBody: CreateCompensationBody;
      requestHeaders: CreateCompensationHeaders;
    }
  >;

export type UseCreateCompensation = (
  options?: UseCreateCompensationOptions,
) => import('react-query').UseMutationResult<
  CreateCompensationData,
  AxiosError<CreateCompensationErrorResponse>,
  {
    requestBody: CreateCompensationBody;
    requestHeaders: CreateCompensationHeaders;
  }
>;

// listSchemaMappings

export type ListSchemaMappingsPathParams = never;

export type HandlerListSchemaMappingsPathParams =
  NormalizeParams<ListSchemaMappingsPathParams>;

export type ListSchemaMappingsQuery =
  import('./schema.ts').operations['listSchemaMappings']['parameters']['query'];

export type ListSchemaMappingsHeaders =
  import('./schema.ts').operations['listSchemaMappings']['parameters']['header'];

export type ListSchemaMappingsBody = never;

export type ListSchemaMappingsData200 =
  import('./schema.ts').operations['listSchemaMappings']['responses'][200]['content']['application/json'];

export type ListSchemaMappingsData = ListSchemaMappingsData200;

export type ListSchemaMappingsDataResponse = { data: ListSchemaMappingsData };

export type ListSchemaMappingsErrorResponse = never;

export type ListSchemaMappingsAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-schema-mapping';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listSchemaMappings';
  };
};

export type ListSchemaMappings = (options: {
  params: ListSchemaMappingsQuery;
  headers: ListSchemaMappingsHeaders;
}) => Promise<ListSchemaMappingsData>;

export type UseListSchemaMappingsKey = [
  ListSchemaMappingsAPI['KEY'],
  ListSchemaMappingsQuery,
  ListSchemaMappingsHeaders,
];

export type UseListSchemaMappingsOptions<Selection = ListSchemaMappingsData> =
  import('react-query').UseQueryOptions<
    ListSchemaMappingsData,
    AxiosError<ListSchemaMappingsErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseListSchemaMappingsKey>
  > & {
    select?: (data: ListSchemaMappingsData) => Selection;
    requestQuery: ListSchemaMappingsQuery;
    requestHeaders: ListSchemaMappingsHeaders;
  };

export type UseListSchemaMappings = <Selection = ListSchemaMappingsData>(
  options: UseListSchemaMappingsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListSchemaMappingsErrorResponse>
>;

// saveSchemaMappings

export type SaveSchemaMappingsPathParams = never;

export type HandlerSaveSchemaMappingsPathParams =
  NormalizeParams<SaveSchemaMappingsPathParams>;

export type SaveSchemaMappingsQuery = never;

export type SaveSchemaMappingsHeaders =
  import('./schema.ts').operations['saveSchemaMappings']['parameters']['header'];

export type SaveSchemaMappingsBody = NonNullable<
  import('./schema.ts').operations['saveSchemaMappings']['requestBody']
>['content']['application/json'];

export type SaveSchemaMappingsData200 =
  import('./schema.ts').operations['saveSchemaMappings']['responses'][200]['content']['application/json'];

export type SaveSchemaMappingsData = SaveSchemaMappingsData200;

export type SaveSchemaMappingsDataResponse = { data: SaveSchemaMappingsData };

export type SaveSchemaMappingsErrorResponse = never;

export type SaveSchemaMappingsAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-schema-mapping';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'saveSchemaMappings';
  };
};

export type SaveSchemaMappings = (options: {
  data: SaveSchemaMappingsBody;
  headers: SaveSchemaMappingsHeaders;
}) => Promise<SaveSchemaMappingsData>;

export type UseSaveSchemaMappingsKey = [SaveSchemaMappingsAPI['KEY']];

export type UseSaveSchemaMappingsOptions =
  import('react-query').UseMutationOptions<
    SaveSchemaMappingsData,
    AxiosError<SaveSchemaMappingsErrorResponse>,
    {
      requestBody: SaveSchemaMappingsBody;
      requestHeaders: SaveSchemaMappingsHeaders;
    }
  >;

export type UseSaveSchemaMappings = (
  options?: UseSaveSchemaMappingsOptions,
) => import('react-query').UseMutationResult<
  SaveSchemaMappingsData,
  AxiosError<SaveSchemaMappingsErrorResponse>,
  {
    requestBody: SaveSchemaMappingsBody;
    requestHeaders: SaveSchemaMappingsHeaders;
  }
>;

// listSystemCompensationSchemas

export type ListSystemCompensationSchemasPathParams = never;

export type HandlerListSystemCompensationSchemasPathParams =
  NormalizeParams<ListSystemCompensationSchemasPathParams>;

export type ListSystemCompensationSchemasQuery = never;

export type ListSystemCompensationSchemasHeaders =
  import('./schema.ts').operations['listSystemCompensationSchemas']['parameters']['header'];

export type ListSystemCompensationSchemasBody = never;

export type ListSystemCompensationSchemasData200 =
  import('./schema.ts').operations['listSystemCompensationSchemas']['responses'][200]['content']['application/json'];

export type ListSystemCompensationSchemasData =
  ListSystemCompensationSchemasData200;

export type ListSystemCompensationSchemasDataResponse = {
  data: ListSystemCompensationSchemasData;
};

export type ListSystemCompensationSchemasErrorResponse = never;

export type ListSystemCompensationSchemasAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/system-compensation-schema';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listSystemCompensationSchemas';
  };
};

export type ListSystemCompensationSchemas = (options: {
  headers: ListSystemCompensationSchemasHeaders;
}) => Promise<ListSystemCompensationSchemasData>;

export type UseListSystemCompensationSchemasKey = [
  ListSystemCompensationSchemasAPI['KEY'],
  ListSystemCompensationSchemasHeaders,
];

export type UseListSystemCompensationSchemasOptions<
  Selection = ListSystemCompensationSchemasData,
> = import('react-query').UseQueryOptions<
  ListSystemCompensationSchemasData,
  AxiosError<ListSystemCompensationSchemasErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListSystemCompensationSchemasKey>
> & {
  select?: (data: ListSystemCompensationSchemasData) => Selection;
  requestHeaders: ListSystemCompensationSchemasHeaders;
};

export type UseListSystemCompensationSchemas = <
  Selection = ListSystemCompensationSchemasData,
>(
  options: UseListSystemCompensationSchemasOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListSystemCompensationSchemasErrorResponse>
>;

// readStudentLoan

export type ReadStudentLoanPathParams =
  import('./schema.ts').operations['readStudentLoan']['parameters']['path'];

export type HandlerReadStudentLoanPathParams =
  NormalizeParams<ReadStudentLoanPathParams>;

export type ReadStudentLoanQuery = never;

export type ReadStudentLoanHeaders =
  import('./schema.ts').operations['readStudentLoan']['parameters']['header'];

export type ReadStudentLoanBody = never;

export type ReadStudentLoanData200 =
  import('./schema.ts').operations['readStudentLoan']['responses'][200]['content']['application/json'];

export type ReadStudentLoanData = ReadStudentLoanData200;

export type ReadStudentLoanDataResponse = { data: ReadStudentLoanData };

export type ReadStudentLoanErrorResponse = never;

export type ReadStudentLoanAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk-student-and-postgraduate-loan/:employeeId';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'readStudentLoan';
  };
};

export type ReadStudentLoan = (options: {
  pathParams: ReadStudentLoanPathParams;
  headers: ReadStudentLoanHeaders;
}) => Promise<ReadStudentLoanData>;

export type UseReadStudentLoanKey = [
  ReadStudentLoanAPI['KEY'],
  ReadStudentLoanPathParams,
  ReadStudentLoanHeaders,
];

export type UseReadStudentLoanOptions<Selection = ReadStudentLoanData> =
  import('react-query').UseQueryOptions<
    ReadStudentLoanData,
    AxiosError<ReadStudentLoanErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseReadStudentLoanKey>
  > & {
    select?: (data: ReadStudentLoanData) => Selection;
    requestPathParams: ReadStudentLoanPathParams;
    requestHeaders: ReadStudentLoanHeaders;
  };

export type UseReadStudentLoan = <Selection = ReadStudentLoanData>(
  options: UseReadStudentLoanOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ReadStudentLoanErrorResponse>
>;

// updateStudentLoan

export type UpdateStudentLoanPathParams =
  import('./schema.ts').operations['updateStudentLoan']['parameters']['path'];

export type HandlerUpdateStudentLoanPathParams =
  NormalizeParams<UpdateStudentLoanPathParams>;

export type UpdateStudentLoanQuery = never;

export type UpdateStudentLoanHeaders =
  import('./schema.ts').operations['updateStudentLoan']['parameters']['header'];

export type UpdateStudentLoanBody = NonNullable<
  import('./schema.ts').operations['updateStudentLoan']['requestBody']
>['content']['application/json'];

export type UpdateStudentLoanData201 = undefined;

export type UpdateStudentLoanData = UpdateStudentLoanData201;

export type UpdateStudentLoanDataResponse = { data: UpdateStudentLoanData };

export type UpdateStudentLoanErrorResponse = never;

export type UpdateStudentLoanAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk-student-and-postgraduate-loan/:employeeId';
  METHOD: 'PUT';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateStudentLoan';
  };
};

export type UpdateStudentLoan = (options: {
  pathParams: UpdateStudentLoanPathParams;
  data: UpdateStudentLoanBody;
  headers: UpdateStudentLoanHeaders;
}) => Promise<UpdateStudentLoanData>;

export type UseUpdateStudentLoanKey = [UpdateStudentLoanAPI['KEY']];

export type UseUpdateStudentLoanOptions =
  import('react-query').UseMutationOptions<
    UpdateStudentLoanData,
    AxiosError<UpdateStudentLoanErrorResponse>,
    {
      requestPathParams: UpdateStudentLoanPathParams;
      requestBody: UpdateStudentLoanBody;
      requestHeaders: UpdateStudentLoanHeaders;
    }
  >;

export type UseUpdateStudentLoan = (
  options?: UseUpdateStudentLoanOptions,
) => import('react-query').UseMutationResult<
  UpdateStudentLoanData,
  AxiosError<UpdateStudentLoanErrorResponse>,
  {
    requestPathParams: UpdateStudentLoanPathParams;
    requestBody: UpdateStudentLoanBody;
    requestHeaders: UpdateStudentLoanHeaders;
  }
>;

// listUKCourtOrders

export type ListUKCourtOrdersPathParams =
  import('./schema.ts').operations['listUKCourtOrders']['parameters']['path'];

export type HandlerListUKCourtOrdersPathParams =
  NormalizeParams<ListUKCourtOrdersPathParams>;

export type ListUKCourtOrdersQuery = never;

export type ListUKCourtOrdersHeaders =
  import('./schema.ts').operations['listUKCourtOrders']['parameters']['header'];

export type ListUKCourtOrdersBody = never;

export type ListUKCourtOrdersData200 =
  import('./schema.ts').operations['listUKCourtOrders']['responses'][200]['content']['application/json'];

export type ListUKCourtOrdersData = ListUKCourtOrdersData200;

export type ListUKCourtOrdersDataResponse = { data: ListUKCourtOrdersData };

export type ListUKCourtOrdersErrorResponse = never;

export type ListUKCourtOrdersAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listUKCourtOrders';
  };
};

export type ListUKCourtOrders = (options: {
  pathParams: ListUKCourtOrdersPathParams;
  headers: ListUKCourtOrdersHeaders;
}) => Promise<ListUKCourtOrdersData>;

export type UseListUKCourtOrdersKey = [
  ListUKCourtOrdersAPI['KEY'],
  ListUKCourtOrdersPathParams,
  ListUKCourtOrdersHeaders,
];

export type UseListUKCourtOrdersOptions<Selection = ListUKCourtOrdersData> =
  import('react-query').UseQueryOptions<
    ListUKCourtOrdersData,
    AxiosError<ListUKCourtOrdersErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseListUKCourtOrdersKey>
  > & {
    select?: (data: ListUKCourtOrdersData) => Selection;
    requestPathParams: ListUKCourtOrdersPathParams;
    requestHeaders: ListUKCourtOrdersHeaders;
  };

export type UseListUKCourtOrders = <Selection = ListUKCourtOrdersData>(
  options: UseListUKCourtOrdersOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListUKCourtOrdersErrorResponse>
>;

// createUKCourtOrder

export type CreateUKCourtOrderPathParams =
  import('./schema.ts').operations['createUKCourtOrder']['parameters']['path'];

export type HandlerCreateUKCourtOrderPathParams =
  NormalizeParams<CreateUKCourtOrderPathParams>;

export type CreateUKCourtOrderQuery = never;

export type CreateUKCourtOrderHeaders =
  import('./schema.ts').operations['createUKCourtOrder']['parameters']['header'];

export type CreateUKCourtOrderBody = NonNullable<
  import('./schema.ts').operations['createUKCourtOrder']['requestBody']
>['content']['application/json'];

export type CreateUKCourtOrderData201 =
  import('./schema.ts').operations['createUKCourtOrder']['responses'][201]['content']['application/json'];

export type CreateUKCourtOrderData = CreateUKCourtOrderData201;

export type CreateUKCourtOrderDataResponse = { data: CreateUKCourtOrderData };

export type CreateUKCourtOrderErrorResponse = never;

export type CreateUKCourtOrderAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'createUKCourtOrder';
  };
};

export type CreateUKCourtOrder = (options: {
  pathParams: CreateUKCourtOrderPathParams;
  data: CreateUKCourtOrderBody;
  headers: CreateUKCourtOrderHeaders;
}) => Promise<CreateUKCourtOrderData>;

export type UseCreateUKCourtOrderKey = [CreateUKCourtOrderAPI['KEY']];

export type UseCreateUKCourtOrderOptions =
  import('react-query').UseMutationOptions<
    CreateUKCourtOrderData,
    AxiosError<CreateUKCourtOrderErrorResponse>,
    {
      requestPathParams: CreateUKCourtOrderPathParams;
      requestBody: CreateUKCourtOrderBody;
      requestHeaders: CreateUKCourtOrderHeaders;
    }
  >;

export type UseCreateUKCourtOrder = (
  options?: UseCreateUKCourtOrderOptions,
) => import('react-query').UseMutationResult<
  CreateUKCourtOrderData,
  AxiosError<CreateUKCourtOrderErrorResponse>,
  {
    requestPathParams: CreateUKCourtOrderPathParams;
    requestBody: CreateUKCourtOrderBody;
    requestHeaders: CreateUKCourtOrderHeaders;
  }
>;

// readUKCourtOrder

export type ReadUKCourtOrderPathParams =
  import('./schema.ts').operations['readUKCourtOrder']['parameters']['path'];

export type HandlerReadUKCourtOrderPathParams =
  NormalizeParams<ReadUKCourtOrderPathParams>;

export type ReadUKCourtOrderQuery = never;

export type ReadUKCourtOrderHeaders =
  import('./schema.ts').operations['readUKCourtOrder']['parameters']['header'];

export type ReadUKCourtOrderBody = never;

export type ReadUKCourtOrderData200 =
  import('./schema.ts').operations['readUKCourtOrder']['responses'][200]['content']['application/json'];

export type ReadUKCourtOrderData = ReadUKCourtOrderData200;

export type ReadUKCourtOrderDataResponse = { data: ReadUKCourtOrderData };

export type ReadUKCourtOrderErrorResponse = never;

export type ReadUKCourtOrderAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'readUKCourtOrder';
  };
};

export type ReadUKCourtOrder = (options: {
  pathParams: ReadUKCourtOrderPathParams;
  headers: ReadUKCourtOrderHeaders;
}) => Promise<ReadUKCourtOrderData>;

export type UseReadUKCourtOrderKey = [
  ReadUKCourtOrderAPI['KEY'],
  ReadUKCourtOrderPathParams,
  ReadUKCourtOrderHeaders,
];

export type UseReadUKCourtOrderOptions<Selection = ReadUKCourtOrderData> =
  import('react-query').UseQueryOptions<
    ReadUKCourtOrderData,
    AxiosError<ReadUKCourtOrderErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseReadUKCourtOrderKey>
  > & {
    select?: (data: ReadUKCourtOrderData) => Selection;
    requestPathParams: ReadUKCourtOrderPathParams;
    requestHeaders: ReadUKCourtOrderHeaders;
  };

export type UseReadUKCourtOrder = <Selection = ReadUKCourtOrderData>(
  options: UseReadUKCourtOrderOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ReadUKCourtOrderErrorResponse>
>;

// updateUKCourtOrder

export type UpdateUKCourtOrderPathParams =
  import('./schema.ts').operations['updateUKCourtOrder']['parameters']['path'];

export type HandlerUpdateUKCourtOrderPathParams =
  NormalizeParams<UpdateUKCourtOrderPathParams>;

export type UpdateUKCourtOrderQuery = never;

export type UpdateUKCourtOrderHeaders =
  import('./schema.ts').operations['updateUKCourtOrder']['parameters']['header'];

export type UpdateUKCourtOrderBody = NonNullable<
  import('./schema.ts').operations['updateUKCourtOrder']['requestBody']
>['content']['application/json'];

export type UpdateUKCourtOrderData200 =
  import('./schema.ts').operations['updateUKCourtOrder']['responses'][200]['content']['application/json'];

export type UpdateUKCourtOrderData = UpdateUKCourtOrderData200;

export type UpdateUKCourtOrderDataResponse = { data: UpdateUKCourtOrderData };

export type UpdateUKCourtOrderErrorResponse = never;

export type UpdateUKCourtOrderAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateUKCourtOrder';
  };
};

export type UpdateUKCourtOrder = (options: {
  pathParams: UpdateUKCourtOrderPathParams;
  data: UpdateUKCourtOrderBody;
  headers: UpdateUKCourtOrderHeaders;
}) => Promise<UpdateUKCourtOrderData>;

export type UseUpdateUKCourtOrderKey = [UpdateUKCourtOrderAPI['KEY']];

export type UseUpdateUKCourtOrderOptions =
  import('react-query').UseMutationOptions<
    UpdateUKCourtOrderData,
    AxiosError<UpdateUKCourtOrderErrorResponse>,
    {
      requestPathParams: UpdateUKCourtOrderPathParams;
      requestBody: UpdateUKCourtOrderBody;
      requestHeaders: UpdateUKCourtOrderHeaders;
    }
  >;

export type UseUpdateUKCourtOrder = (
  options?: UseUpdateUKCourtOrderOptions,
) => import('react-query').UseMutationResult<
  UpdateUKCourtOrderData,
  AxiosError<UpdateUKCourtOrderErrorResponse>,
  {
    requestPathParams: UpdateUKCourtOrderPathParams;
    requestBody: UpdateUKCourtOrderBody;
    requestHeaders: UpdateUKCourtOrderHeaders;
  }
>;

// listUKCourtOrderDeductions

export type ListUKCourtOrderDeductionsPathParams =
  import('./schema.ts').operations['listUKCourtOrderDeductions']['parameters']['path'];

export type HandlerListUKCourtOrderDeductionsPathParams =
  NormalizeParams<ListUKCourtOrderDeductionsPathParams>;

export type ListUKCourtOrderDeductionsQuery = never;

export type ListUKCourtOrderDeductionsHeaders =
  import('./schema.ts').operations['listUKCourtOrderDeductions']['parameters']['header'];

export type ListUKCourtOrderDeductionsBody = never;

export type ListUKCourtOrderDeductionsData200 =
  import('./schema.ts').operations['listUKCourtOrderDeductions']['responses'][200]['content']['application/json'];

export type ListUKCourtOrderDeductionsData = ListUKCourtOrderDeductionsData200;

export type ListUKCourtOrderDeductionsDataResponse = {
  data: ListUKCourtOrderDeductionsData;
};

export type ListUKCourtOrderDeductionsErrorResponse = never;

export type ListUKCourtOrderDeductionsAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId/deductions';
  METHOD: 'GET';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'listUKCourtOrderDeductions';
  };
};

export type ListUKCourtOrderDeductions = (options: {
  pathParams: ListUKCourtOrderDeductionsPathParams;
  headers: ListUKCourtOrderDeductionsHeaders;
}) => Promise<ListUKCourtOrderDeductionsData>;

export type UseListUKCourtOrderDeductionsKey = [
  ListUKCourtOrderDeductionsAPI['KEY'],
  ListUKCourtOrderDeductionsPathParams,
  ListUKCourtOrderDeductionsHeaders,
];

export type UseListUKCourtOrderDeductionsOptions<
  Selection = ListUKCourtOrderDeductionsData,
> = import('react-query').UseQueryOptions<
  ListUKCourtOrderDeductionsData,
  AxiosError<ListUKCourtOrderDeductionsErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseListUKCourtOrderDeductionsKey>
> & {
  select?: (data: ListUKCourtOrderDeductionsData) => Selection;
  requestPathParams: ListUKCourtOrderDeductionsPathParams;
  requestHeaders: ListUKCourtOrderDeductionsHeaders;
};

export type UseListUKCourtOrderDeductions = <
  Selection = ListUKCourtOrderDeductionsData,
>(
  options: UseListUKCourtOrderDeductionsOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<ListUKCourtOrderDeductionsErrorResponse>
>;

// updateUKCourtOrderDeduction

export type UpdateUKCourtOrderDeductionPathParams =
  import('./schema.ts').operations['updateUKCourtOrderDeduction']['parameters']['path'];

export type HandlerUpdateUKCourtOrderDeductionPathParams =
  NormalizeParams<UpdateUKCourtOrderDeductionPathParams>;

export type UpdateUKCourtOrderDeductionQuery = never;

export type UpdateUKCourtOrderDeductionHeaders =
  import('./schema.ts').operations['updateUKCourtOrderDeduction']['parameters']['header'];

export type UpdateUKCourtOrderDeductionBody = NonNullable<
  import('./schema.ts').operations['updateUKCourtOrderDeduction']['requestBody']
>['content']['application/json'];

export type UpdateUKCourtOrderDeductionData200 =
  import('./schema.ts').operations['updateUKCourtOrderDeduction']['responses'][200]['content']['application/json'];

export type UpdateUKCourtOrderDeductionData =
  UpdateUKCourtOrderDeductionData200;

export type UpdateUKCourtOrderDeductionDataResponse = {
  data: UpdateUKCourtOrderDeductionData;
};

export type UpdateUKCourtOrderDeductionErrorResponse = never;

export type UpdateUKCourtOrderDeductionAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId/deductions/:payrollId';
  METHOD: 'POST';
  KEY: {
    service: 'International Personio Payroll';
    operationId: 'updateUKCourtOrderDeduction';
  };
};

export type UpdateUKCourtOrderDeduction = (options: {
  pathParams: UpdateUKCourtOrderDeductionPathParams;
  data: UpdateUKCourtOrderDeductionBody;
  headers: UpdateUKCourtOrderDeductionHeaders;
}) => Promise<UpdateUKCourtOrderDeductionData>;

export type UseUpdateUKCourtOrderDeductionKey = [
  UpdateUKCourtOrderDeductionAPI['KEY'],
];

export type UseUpdateUKCourtOrderDeductionOptions =
  import('react-query').UseMutationOptions<
    UpdateUKCourtOrderDeductionData,
    AxiosError<UpdateUKCourtOrderDeductionErrorResponse>,
    {
      requestPathParams: UpdateUKCourtOrderDeductionPathParams;
      requestBody: UpdateUKCourtOrderDeductionBody;
      requestHeaders: UpdateUKCourtOrderDeductionHeaders;
    }
  >;

export type UseUpdateUKCourtOrderDeduction = (
  options?: UseUpdateUKCourtOrderDeductionOptions,
) => import('react-query').UseMutationResult<
  UpdateUKCourtOrderDeductionData,
  AxiosError<UpdateUKCourtOrderDeductionErrorResponse>,
  {
    requestPathParams: UpdateUKCourtOrderDeductionPathParams;
    requestBody: UpdateUKCourtOrderDeductionBody;
    requestHeaders: UpdateUKCourtOrderDeductionHeaders;
  }
>;
