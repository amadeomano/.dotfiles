import { useInfiniteQuery } from 'react-query';
import { useAuthContext } from '@personio-web/auth-context';

import { goferRequest } from '../../client/client';

import { type ScalarVariables } from '../../types/document';
import { type UseInfiniteGoferQueryParams } from '../../types/query';
import { getQueryKeyForDocument } from '../utils/getQueryKeyForDocument';

/**
 * A hook for fetching paginated data from Gofer using a GraphQL query.
 * Wraps react-query's useInfiniteQuery and sends the request using the request library.
 *
 * Should be used with a typed document node created with the `graphql` function.
 *
 * @example Basic usage:
 * const { data, isLoading, fetchNextPage } = useInfiniteGoferQuery({ document: CycleList });
 *
 * @example With variables:
 * const { data, isLoading, fetchNextPage } = useInfiniteGoferQuery({ document: CycleList, variables: { pageSize: 10 } });
 *
 * @example With getNextPageParam:
 * const { data, isLoading, fetchNextPage } = useInfiniteGoferQuery({
 *   document: CycleList,
 *   queryOptions: {
 *     getNextPageParam: (lastPage) => lastPage.data?.workforceplanning_CycleService_ListCycles_v1alpha1?.nextPageToken,
 *   },
 * });
 *
 * @example With getPreviousPageParam:
 * const { data, isLoading, fetchPreviousPage } = useInfiniteGoferQuery({
 *   document: CycleList,
 *   queryOptions: {
 *     getPreviousPageParam: (firstPage) => firstPage.data?.workforceplanning_CycleService_ListCycles_v1alpha1?.nextPageToken,
 *   },
 * });
 */
export const useInfiniteGoferQuery = <
  TData = never,
  TVariables extends ScalarVariables = ScalarVariables,
>({
  document,
  variables,
  queryOptions,
}: UseInfiniteGoferQueryParams<TData, TVariables>) => {
  // Get the company ID from the auth context
  const { companyId } = useAuthContext();

  // determine query key based on the document, variables, and query options
  const queryKeys = getQueryKeyForDocument({
    document,
    variables,
    queryOptions,
  });

  // Remove the queryKey from the query options to avoid passing it to react-query twice
  const { queryKey: _, ...queryOptionsWithoutKey } = queryOptions ?? {};

  console.log('[] keys', queryKeys);
  console.log('[] document', document);
  return useInfiniteQuery(
    queryKeys,
    () =>
      goferRequest({
        operation: document,
        options: { companyId, operationType: 'query', variables },
      }),
    { ...queryOptionsWithoutKey },
  );
};
