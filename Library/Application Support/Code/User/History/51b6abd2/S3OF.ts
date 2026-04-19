import {
  type ListEmploymentsByPersonIdsQueryResult,
  type ListEmploymentsByPersonIdsQueryVariables,
} from '../hooks';

import {
  generateEmploymentData,
  generateEmptyEmploymentData,
} from './generateEmploymentData';

type ListEmploymentsByPersonIdsQueryMockVariables =
  Partial<ListEmploymentsByPersonIdsQueryVariables> &
    Pick<ListEmploymentsByPersonIdsQueryVariables, 'personIds'>;

type HandlerReturn = { data: ListEmploymentsByPersonIdsQueryResult };

export function listEmploymentsByPersonIdsResponse({
  variables: { personIds, pageSize, pageToken, ...includeAttributes },
}: {
  variables: ListEmploymentsByPersonIdsQueryMockVariables;
}): HandlerReturn {
  console.log('[] mock handler called with', {
    personIds,
    pageSize,
    pageToken,
  });
  const ids = Array.isArray(personIds) ? personIds : [personIds];
  const numericPageSize = pageSize ?? 5;
  const cursor = pageToken ? Number.parseInt(pageToken) : 0;
  const items = ids
    .slice(cursor, cursor + numericPageSize)
    .map((personId) => generateEmploymentData(personId, includeAttributes));

  const nextPageCursor = cursor + numericPageSize;
  const nextPageToken =
    ids.length - nextPageCursor >= 0
      ? nextPageCursor
      : cursor + (ids.length - cursor);
  return {
    data: {
      employments: {
        nextPageToken: String(nextPageToken),
        items,
      },
    },
  };
}

export function listEmptyEmploymentsByPersonIdsResponse({
  variables: { personIds, ...includeAttributes },
}: {
  variables: ListEmploymentsByPersonIdsQueryMockVariables;
}): HandlerReturn {
  const items = (Array.isArray(personIds) ? personIds : [personIds]).map(
    (personId) => generateEmptyEmploymentData(personId, includeAttributes),
  );

  return {
    data: {
      employments: {
        nextPageToken: '',
        items,
      },
    },
  };
}
