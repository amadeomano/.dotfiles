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

export function listEmploymentsByPersonIdsResponse({
  personIds,
  ...includeAttributes
}: ListEmploymentsByPersonIdsQueryMockVariables): ListEmploymentsByPersonIdsQueryResult {
  return {
    employments: {
      items: (Array.isArray(personIds) ? personIds : [personIds]).map(
        (personId) => generateEmploymentData(personId, includeAttributes),
      ),
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

export const listInaccessibleEmploymentsByPersonIdsResponse: ListEmploymentsByPersonIdsQuery =
  {
    employments: {
      items: [],
      __typename: 'personandemployment_ListEmploymentsResponse_v1',
    },
  };

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
