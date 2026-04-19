// export const listEmploymentsByPersonIdsResponse = (variables: any) => {
//   return { data: { variables } };
// };
import { generateEmploymentData } from './generateEmploymentData';
// export const listEmploymentsByPersonIdsResponse = ({ variables }: any) => {
//   const result = variables.personIds.map((id: string) =>
//     generateEmploymentData(id),
//   );
//   console.log('[] result', result);
//   return result;
// };
export const listEmploymentsByPersonIdsResponse = () => ({
  data: {
    employments: {
      nextPageToken: 'target',
      items: [
        {
          id: '7050',
          person: { preferredName: { value: 'Peter - 4' } },
          status: {},
          type: {},
          positionTitle: {},
          departmentEntity: {},
          teamEntity: {},
          officeEntity: {},
          legalEntityDetails: {},
          costCenters: {},
          termination: {},
          startDate: {},
          contractEndDate: {},
          personEntity: {},
          jobEntity: {},
        },
        {
          id: '2632',
          person: {},
          status: {},
          type: {},
          positionTitle: {},
          departmentEntity: {},
          teamEntity: {},
          officeEntity: {},
          legalEntityDetails: {},
          costCenters: {},
          termination: {},
          startDate: {},
          contractEndDate: {},
          personEntity: {},
          jobEntity: {},
        },
      ],
    },
  },
});
