import { type ListPersonsByIdsQuery } from '@personio-web/payroll-data-gofer-types';

export const listEmptyPersonsByIds: ListPersonsByIdsQuery = {};

export const listLegalEntity1943PersonsByIds: ListPersonsByIdsQuery = {
  {
    "data": {
        "persons": {
            "list": [
                {
                    "id": "204297",
                    "firstName": {
                        "value": "Alfred",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "lastName": {
                        "value": "Jones",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "profilePicUrls": null,
                    "__typename": "personandemployment_Person_v1"
                },
                {
                    "id": "204298",
                    "firstName": {
                        "value": "Ashley",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "lastName": {
                        "value": "Hughes",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "profilePicUrls": null,
                    "__typename": "personandemployment_Person_v1"
                },
                {
                    "id": "204324",
                    "firstName": {
                        "value": "Elisabeth",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "lastName": {
                        "value": "Schmidt",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "profilePicUrls": null,
                    "__typename": "personandemployment_Person_v1"
                },
                {
                    "id": "204325",
                    "firstName": {
                        "value": "Alena",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "lastName": {
                        "value": "Jacobs",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "profilePicUrls": null,
                    "__typename": "personandemployment_Person_v1"
                },
                {
                    "id": "204328",
                    "firstName": {
                        "value": "Alan",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "lastName": {
                        "value": "Foster",
                        "__typename": "personandemployment_StringAttribute_v1"
                    },
                    "profilePicUrls": null,
                    "__typename": "personandemployment_Person_v1"
                }
            ],
            "__typename": "personandemployment_ListPersonsResponse_v1"
        }
    }
}
};

export const listHolidayCalendarsPartiallyAavailableResponse: ListHolidayCalendarsQuery =
  {
    calendars: {
      __typename: 'holidaycalendar_ListCalendarsResponse_v1beta',
      system: [
        {
          id: 'system-1',
          name: 'System Calendar 1',
          __typename: 'holidaycalendar_Calendar_v1beta',
        },
      ],
      custom: [],
    },
  };
