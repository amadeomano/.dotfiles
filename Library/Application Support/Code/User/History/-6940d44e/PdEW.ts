// export const listEmploymentsByPersonIdsResponse = (variables: any) => {
//   return { data: { variables } };
// };
export const listEmploymentsByPersonIdsResponse = () => ({
  data: {
    employments: {
      employmentsList: [{}, {}],
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
