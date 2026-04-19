import { type ListPersonsByIdsQuery } from '@personio-web/payroll-data-gofer-types';

export const listEmptyPersonsByIds: ListPersonsByIdsQuery = {};

export const listnotAvailableHolidayCalendarsResponse: ListHolidayCalendarsQuery =
  {};

export const listHolidayCalendarsResponse: ListHolidayCalendarsQuery = {
  calendars: {
    __typename: 'holidaycalendar_ListCalendarsResponse_v1beta',
    custom: [
      {
        id: 'holiday-1',
        name: "New Year's Day",
        __typename: 'holidaycalendar_Calendar_v1beta',
      },
      {
        id: 'holiday-2',
        name: 'Independence Day',
        __typename: 'holidaycalendar_Calendar_v1beta',
      },
    ],
    system: [
      {
        id: 'holiday-3',
        name: 'Labor Day',
        __typename: 'holidaycalendar_Calendar_v1beta',
      },
      {
        id: 'holiday-4',
        name: 'Thanksgiving',
        __typename: 'holidaycalendar_Calendar_v1beta',
      },
    ],
  },
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
