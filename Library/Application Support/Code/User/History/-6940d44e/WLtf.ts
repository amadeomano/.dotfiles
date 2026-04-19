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
        nextPageToken: String(ids.length),
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

// export const listEmploymentsByPersonIdsResponse = (variables: any) => {
//   return { data: { variables } };
// };
// export const listEmploymentsByPersonIdsResponse = ({ variables }: any) => {
//   const result = variables.personIds.map((id: string) =>
//     generateEmploymentData(id),
//   );
//   console.log('[] result', result);
//   return result;
// };
// export const listEmploymentsByPersonIdsResponse = () => ({
//   data: {
//     employments: {
//       nextPageToken: 'target',
//       items: [
//         {
//           id: '7050',
//           person: { preferredName: { value: 'Peter - 4' } },
//           status: {},
//           type: {},
//           positionTitle: {},
//           departmentEntity: {},
//           teamEntity: {},
//           officeEntity: {},
//           legalEntityDetails: {},
//           costCenters: {},
//           termination: {},
//           startDate: {},
//           contractEndDate: {},
//           personEntity: {},
//           jobEntity: {},
//         },
//         {
//           id: '2632',
//           person: {},
//           status: {},
//           type: {},
//           positionTitle: {},
//           departmentEntity: {},
//           teamEntity: {},
//           officeEntity: {},
//           legalEntityDetails: {},
//           costCenters: {},
//           termination: {},
//           startDate: {},
//           contractEndDate: {},
//           personEntity: {},
//           jobEntity: {},
//         },
//       ],
//     },
//   },
// });
