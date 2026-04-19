/**
 * DO NOT MODIFY THIS FILE
 * This file in generated automatically by the @personio-web/nx-request-sync executor
 */

import type { AxiosError, AxiosRequestConfig } from 'axios';

type NormalizeParams<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
};

// GetAllPayrollSettings

export type GetAllPayrollSettingsPathParams = never;

export type HandlerGetAllPayrollSettingsPathParams =
  NormalizeParams<GetAllPayrollSettingsPathParams>;

export type GetAllPayrollSettingsQuery = never;

export type GetAllPayrollSettingsHeaders = never;

export type GetAllPayrollSettingsBody = never;

export type GetAllPayrollSettingsData200 =
  import('./schema.ts').operations['GetAllPayrollSettings']['responses'][200]['content']['application/json'];

export type GetAllPayrollSettingsData = GetAllPayrollSettingsData200;

export type GetAllPayrollSettingsDataResponse = {
  data: GetAllPayrollSettingsData;
};

export type GetAllPayrollSettingsErrorResponse = never;

export type GetAllPayrollSettingsAPI = {
  API_PATH: '/api/v1/payroll/settings';
  METHOD: 'GET';
  KEY: {
    service: 'Salary and Payroll Settings';
    operationId: 'GetAllPayrollSettings';
  };
};

export type GetAllPayrollSettings = (
  options?: AxiosRequestConfig,
) => Promise<GetAllPayrollSettingsData>;

export type UseGetAllPayrollSettingsKey = [GetAllPayrollSettingsAPI['KEY']];

export type UseGetAllPayrollSettingsOptions<
  Selection = GetAllPayrollSettingsData,
> = import('react-query').UseQueryOptions<
  GetAllPayrollSettingsData,
  AxiosError<GetAllPayrollSettingsErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseGetAllPayrollSettingsKey>
> & {
  select?: (data: GetAllPayrollSettingsData) => Selection;
};

export type UseGetAllPayrollSettings = <Selection = GetAllPayrollSettingsData>(
  options?: UseGetAllPayrollSettingsOptions<Selection>,
    axiosOptions?: AxiosRequestConfig;
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetAllPayrollSettingsErrorResponse>
>;

// SaveAllSettings

export type SaveAllSettingsPathParams = never;

export type HandlerSaveAllSettingsPathParams =
  NormalizeParams<SaveAllSettingsPathParams>;

export type SaveAllSettingsQuery = never;

export type SaveAllSettingsHeaders = never;

export type SaveAllSettingsBody = NonNullable<
  import('./schema.ts').operations['SaveAllSettings']['requestBody']
>['content']['application/json'];

export type SaveAllSettingsData204 = undefined;

export type SaveAllSettingsErrorResponse400 =
  import('./schema.ts').operations['SaveAllSettings']['responses'][400]['content']['application/json'];

export type SaveAllSettingsData = SaveAllSettingsData204;

export type SaveAllSettingsDataResponse = { data: SaveAllSettingsData };

export type SaveAllSettingsErrorResponse = SaveAllSettingsErrorResponse400;

export type SaveAllSettingsAPI = {
  API_PATH: '/api/v1/payroll/settings';
  METHOD: 'POST';
  KEY: {
    service: 'Salary and Payroll Settings';
    operationId: 'SaveAllSettings';
  };
};

export type SaveAllSettings = (
  options: { data: SaveAllSettingsBody } & Omit<AxiosRequestConfig, 'data'>,
) => Promise<SaveAllSettingsData>;

export type UseSaveAllSettingsKey = [SaveAllSettingsAPI['KEY']];

export type UseSaveAllSettingsOptions =
  import('react-query').UseMutationOptions<
    SaveAllSettingsData,
    AxiosError<SaveAllSettingsErrorResponse>,
    { requestBody: SaveAllSettingsBody } & Omit<AxiosRequestConfig, 'data'>
  >;

export type UseSaveAllSettings = (
  options?: UseSaveAllSettingsOptions,
) => import('react-query').UseMutationResult<
  SaveAllSettingsData,
  AxiosError<SaveAllSettingsErrorResponse>,
  { requestBody: SaveAllSettingsBody } & Omit<AxiosRequestConfig, 'data'>
>;

// GetPayrollsContext

export type GetPayrollsContextPathParams = never;

export type HandlerGetPayrollsContextPathParams =
  NormalizeParams<GetPayrollsContextPathParams>;

export type GetPayrollsContextQuery = never;

export type GetPayrollsContextHeaders = never;

export type GetPayrollsContextBody = never;

export type GetPayrollsContextData200 =
  import('./schema.ts').operations['GetPayrollsContext']['responses'][200]['content']['application/json'];

export type GetPayrollsContextData = GetPayrollsContextData200;

export type GetPayrollsContextDataResponse = { data: GetPayrollsContextData };

export type GetPayrollsContextErrorResponse = never;

export type GetPayrollsContextAPI = {
  API_PATH: '/api/v2/payrolls/context';
  METHOD: 'GET';
  KEY: {
    service: 'Salary and Payroll Settings';
    operationId: 'GetPayrollsContext';
  };
};

export type GetPayrollsContext = (
  options?: AxiosRequestConfig,
) => Promise<GetPayrollsContextData>;

export type UseGetPayrollsContextKey = [GetPayrollsContextAPI['KEY']];

export type UseGetPayrollsContextOptions<Selection = GetPayrollsContextData> =
  import('react-query').UseQueryOptions<
    GetPayrollsContextData,
    AxiosError<GetPayrollsContextErrorResponse>,
    Selection,
    import('react-query').EnsuredQueryKey<UseGetPayrollsContextKey>
  > & {
    select?: (data: GetPayrollsContextData) => Selection;
  };

export type UseGetPayrollsContext = <Selection = GetPayrollsContextData>(
  options?: {
    axiosOptions?: AxiosRequestConfig;
  } & UseGetPayrollsContextOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetPayrollsContextErrorResponse>
>;

// GetIsPayrollGroupsActive

export type GetIsPayrollGroupsActivePathParams = never;

export type HandlerGetIsPayrollGroupsActivePathParams =
  NormalizeParams<GetIsPayrollGroupsActivePathParams>;

export type GetIsPayrollGroupsActiveQuery = never;

export type GetIsPayrollGroupsActiveHeaders = never;

export type GetIsPayrollGroupsActiveBody = never;

export type GetIsPayrollGroupsActiveData200 =
  import('./schema.ts').operations['GetIsPayrollGroupsActive']['responses'][200]['content']['application/json'];

export type GetIsPayrollGroupsActiveData = GetIsPayrollGroupsActiveData200;

export type GetIsPayrollGroupsActiveDataResponse = {
  data: GetIsPayrollGroupsActiveData;
};

export type GetIsPayrollGroupsActiveErrorResponse = never;

export type GetIsPayrollGroupsActiveAPI = {
  API_PATH: '/api/v1/features/payroll-accounting-groups';
  METHOD: 'GET';
  KEY: {
    service: 'Salary and Payroll Settings';
    operationId: 'GetIsPayrollGroupsActive';
  };
};

export type GetIsPayrollGroupsActive = (
  options?: AxiosRequestConfig,
) => Promise<GetIsPayrollGroupsActiveData>;

export type UseGetIsPayrollGroupsActiveKey = [
  GetIsPayrollGroupsActiveAPI['KEY'],
];

export type UseGetIsPayrollGroupsActiveOptions<
  Selection = GetIsPayrollGroupsActiveData,
> = import('react-query').UseQueryOptions<
  GetIsPayrollGroupsActiveData,
  AxiosError<GetIsPayrollGroupsActiveErrorResponse>,
  Selection,
  import('react-query').EnsuredQueryKey<UseGetIsPayrollGroupsActiveKey>
> & {
  select?: (data: GetIsPayrollGroupsActiveData) => Selection;
};

export type UseGetIsPayrollGroupsActive = <
  Selection = GetIsPayrollGroupsActiveData,
>(
  options?: {
    axiosOptions?: AxiosRequestConfig;
  } & UseGetIsPayrollGroupsActiveOptions<Selection>,
) => import('react-query').UseQueryResult<
  Selection,
  AxiosError<GetIsPayrollGroupsActiveErrorResponse>
>;
