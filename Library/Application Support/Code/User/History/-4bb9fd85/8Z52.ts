import type {
  ListEmploymentsByPersonIdsQueryVariables,
  ListEmploymentsByPersonIdsQuery,
} from '@personio-web/employees-organizations-data-gofer-types';
import {
  generateEmploymentData,
  generateEmptyEmploymentData,
} from './generateEmploymentData';

type ListEmploymentsByPersonIdsQueryMockVariables =
  Partial<ListEmploymentsByPersonIdsQueryVariables> &
    Pick<ListEmploymentsByPersonIdsQueryVariables, 'personIds'>;

export function listEmploymentsByPersonIdsResponse({
  personIds,
  ...includeAttributes
}: ListEmploymentsByPersonIdsQueryMockVariables): ListEmploymentsByPersonIdsQuery {
  return {
    employments: {
      items: (Array.isArray(personIds) ? personIds : [personIds]).map(
        (personId) => generateEmploymentData(personId, includeAttributes),
      ),
      __typename: 'personandemployment_ListEmploymentsResponse_v1',
    },
  };
}

export function listEmptyEmploymentsByPersonIdsResponse({
  personIds,
  ...includeAttributes
}: ListEmploymentsByPersonIdsQueryMockVariables): ListEmploymentsByPersonIdsQuery {
  return {
    employments: {
      items: (Array.isArray(personIds) ? personIds : [personIds]).map(
        (personId) => generateEmptyEmploymentData(personId, includeAttributes),
      ),
      __typename: 'personandemployment_ListEmploymentsResponse_v1',
    },
  };
}

export function listEmploymentsByPersonIdsWithoutPreferredNameResponse(
  variables: ListEmploymentsByPersonIdsQueryMockVariables,
): ListEmploymentsByPersonIdsQuery {
  const response = listEmploymentsByPersonIdsResponse(variables);

  response.employments?.items?.forEach((item) => {
    if (item?.person) {
      item.person.preferredName = null;
    }
  });

  return response;
}

export const listInaccessibleEmploymentsByPersonIdsResponse: ListEmploymentsByPersonIdsQuery =
  {
    employments: {
      items: [],
      __typename: 'personandemployment_ListEmploymentsResponse_v1',
    },
  };
