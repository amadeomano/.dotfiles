import type * as Types from '@personio-web/payroll-data-gofer-types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const ListPersonsByIdsDocument = gql`
  query ListPersonsByIds($personIds: [String!]!, $companyId: Int!) {
    persons: personandemployment_PersonService_ListPersons_v1(
      input: { personIds: { ids: $personIds } }
    ) {
      list: personsList {
        id
        firstName {
          value
          __typename
        }
        lastName {
          value
          __typename
        }
        profilePicUrls(path: { companyId: $companyId }) {
          paths {
            small
            medium
            large
            __typename
          }
        }
        __typename
      }
    }
  }
`;

/**
 * __useListPersonsByIdsQuery__
 *
 * To run a query within a React component, call `useListPersonsByIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPersonsByIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPersonsByIdsQuery({
 *   variables: {
 *      personIds: // value for 'personIds'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListPersonsByIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    Types.ListPersonsByIdsQuery,
    Types.ListPersonsByIdsQueryVariables
  > &
    (
      | { variables: Types.ListPersonsByIdsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.ListPersonsByIdsQuery,
    Types.ListPersonsByIdsQueryVariables
  >(ListPersonsByIdsDocument, options);
}
export function useListPersonsByIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.ListPersonsByIdsQuery,
    Types.ListPersonsByIdsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.ListPersonsByIdsQuery,
    Types.ListPersonsByIdsQueryVariables
  >(ListPersonsByIdsDocument, options);
}
export function useListPersonsByIdsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    Types.ListPersonsByIdsQuery,
    Types.ListPersonsByIdsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    Types.ListPersonsByIdsQuery,
    Types.ListPersonsByIdsQueryVariables
  >(ListPersonsByIdsDocument, options);
}
export type ListPersonsByIdsQueryHookResult = ReturnType<
  typeof useListPersonsByIdsQuery
>;
export type ListPersonsByIdsLazyQueryHookResult = ReturnType<
  typeof useListPersonsByIdsLazyQuery
>;
export type ListPersonsByIdsSuspenseQueryHookResult = ReturnType<
  typeof useListPersonsByIdsSuspenseQuery
>;
