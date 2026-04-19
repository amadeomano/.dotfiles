import {
  type ListPersonsByIdsQuery,
  type ListPersonsByIdsQueryVariables,
} from '@personio-web/payroll-data-gofer-types';

const names = [
  { firstName: 'Alfred', lastName: 'Jones' },
  { firstName: 'Alfred', lastName: 'Jones' },
];

export const listLegalEntity1943PersonsById = (
  variables: ListPersonsByIdsQueryVariables,
): ListPersonsByIdsQuery => ({
  persons: {
    list: [
      {
        id: '204297',
        firstName: {
          value: 'Alfred',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        lastName: {
          value: 'Jones',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        profilePicUrls: null,
        __typename: 'personandemployment_Person_v1',
      },
      {
        id: '204298',
        firstName: {
          value: 'Ashley',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        lastName: {
          value: 'Hughes',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        profilePicUrls: null,
        __typename: 'personandemployment_Person_v1',
      },
      {
        id: '204324',
        firstName: {
          value: 'Elisabeth',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        lastName: {
          value: 'Schmidt',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        profilePicUrls: null,
        __typename: 'personandemployment_Person_v1',
      },
      {
        id: '204325',
        firstName: {
          value: 'Alena',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        lastName: {
          value: 'Jacobs',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        profilePicUrls: null,
        __typename: 'personandemployment_Person_v1',
      },
      {
        id: '204328',
        firstName: {
          value: 'Alan',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        lastName: {
          value: 'Foster',
          __typename: 'personandemployment_StringAttribute_v1',
        },
        profilePicUrls: null,
        __typename: 'personandemployment_Person_v1',
      },
    ],
    __typename: 'personandemployment_ListPersonsResponse_v1',
  },
});

export const listEmptyPersonsById: ListPersonsByIdsQuery = {};
