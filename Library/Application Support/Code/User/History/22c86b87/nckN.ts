import { type ListEmploymentsByPersonIdsQuery } from '@personio-web/employees-organizations-data-gofer';

export function updateEmploymentsQuery({
  fetchMoreResult,
}: {
  fetchMoreResult: ListEmploymentsByPersonIdsQuery;
}) {
  if (!fetchMoreResult) {
    return previousResult;
  }

  const previousItems = previousResult.employments?.items ?? [];
  const nextItems = fetchMoreResult.employments?.items ?? [];

  fetchMoreResult.employments = {
    ...fetchMoreResult.employments,
    items: [...previousItems, ...nextItems],
  };

  return { ...fetchMoreResult };
}
