export type UseListPersonsByIdsQuery = (
  baseOptions: import('@apollo/client').QueryHookOptions<
    import('./operations').ListPersonsByIdsQuery,
    import('./operations').ListPersonsByIdsQueryVariables
  > &
    (
      | {
          variables: import('./operations').ListPersonsByIdsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    ),
) => import('@apollo/client').QueryResult<
  import('./operations').ListPersonsByIdsQuery,
  import('./operations').ListPersonsByIdsQueryVariables
>;
