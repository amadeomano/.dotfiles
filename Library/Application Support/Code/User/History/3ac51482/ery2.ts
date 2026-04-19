import type * as Types from '@personio-web/payroll-data-gofer-types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Pay_PeopleTable_ListPersonsByIds_V2024111901Document = gql`
  query PAY_PeopleTable_ListPersonsByIds_v2024111901(
    $personIds: [String!]!
    $companyId: Int!
  ) {
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
 * __usePay_PeopleTable_ListPersonsByIds_V2024111901Query__
 *
 * To run a query within a React component, call `usePay_PeopleTable_ListPersonsByIds_V2024111901Query` and pass it any options that fit your needs.
 * When your component renders, `usePay_PeopleTable_ListPersonsByIds_V2024111901Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePay_PeopleTable_ListPersonsByIds_V2024111901Query({
 *   variables: {
 *      personIds: // value for 'personIds'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function usePay_PeopleTable_ListPersonsByIds_V2024111901Query(
  baseOptions: Apollo.QueryHookOptions<
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901Query,
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables
  > &
    (
      | {
          variables: Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901Query,
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables
  >(Pay_PeopleTable_ListPersonsByIds_V2024111901Document, options);
}
export function usePay_PeopleTable_ListPersonsByIds_V2024111901LazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901Query,
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901Query,
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables
  >(Pay_PeopleTable_ListPersonsByIds_V2024111901Document, options);
}
export function usePay_PeopleTable_ListPersonsByIds_V2024111901SuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901Query,
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901Query,
    Types.Pay_PeopleTable_ListPersonsByIds_V2024111901QueryVariables
  >(Pay_PeopleTable_ListPersonsByIds_V2024111901Document, options);
}
export type Pay_PeopleTable_ListPersonsByIds_V2024111901QueryHookResult =
  ReturnType<typeof usePay_PeopleTable_ListPersonsByIds_V2024111901Query>;
export type Pay_PeopleTable_ListPersonsByIds_V2024111901LazyQueryHookResult =
  ReturnType<typeof usePay_PeopleTable_ListPersonsByIds_V2024111901LazyQuery>;
export type Pay_PeopleTable_ListPersonsByIds_V2024111901SuspenseQueryHookResult =
  ReturnType<
    typeof usePay_PeopleTable_ListPersonsByIds_V2024111901SuspenseQuery
  >;
