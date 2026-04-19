import type { UseQueryOptions } from '@tanstack/react-query';
import {
  type MaybePersistedTypedDocument,
  type ScalarVariables,
} from './document';
import type { GoferError } from './errors';
import { type UseInfiniteQueryOptions } from '@tanstack/react-query';

export type GraphQLResponse<TData = never> = {
  data?: TData;
  errors?: GoferError[];
};

export type VariablesAndQueryOptions<TData> = {
  variables?: ScalarVariables;
  queryOptions?: UseQueryOptions<GraphQLResponse<TData>, { name: string }>;
};

export type UseGoferQueryParams<TData = never, TVariables = ScalarVariables> = {
  document: MaybePersistedTypedDocument<TData, TVariables>;
  variables?: TVariables;
  queryOptions?: UseQueryOptions<GraphQLResponse<TData>>;
};

export type VariablesAndInfiniteQueryOptions<TData> = {
  variables?: ScalarVariables;
  queryOptions?: UseInfiniteQueryOptions<GraphQLResponse<TData>>;
};

export type UseInfiniteGoferQueryParams<
  TData = never,
  TVariables = ScalarVariables,
> = {
  document: MaybePersistedTypedDocument<TData, TVariables>;
  variables?: TVariables;
  queryOptions?: UseInfiniteQueryOptions<GraphQLResponse<TData>>;
};

export type UseGoferOrInfiniteQueryParams<
  TData = never,
  TVariables = ScalarVariables,
> = {
  document: MaybePersistedTypedDocument<TData, TVariables>;
  variables?: TVariables;
  queryOptions?:
    | UseQueryOptions<GraphQLResponse<TData>>
    | UseInfiniteQueryOptions<GraphQLResponse<TData>>;
};
