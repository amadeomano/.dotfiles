import {
  PayrollIntegrationErrorResponse,
  PeopleDataResponse,
} from '@personio-web/payroll-data-payroll-integration-hub';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

export const getPeopleData = (
  integration: PayrollIntegration,
): PeopleDataResponse => {
  if (integration === 'xero') {
    return {
      data: [
        {
          person: {
            id: '123',
            first_name: 'abc',
            last_name: 'cde',
          },
          employee_number: '123',
          gross_salary: {
            amount: 123,
            currency: 'GBP',
            type: 'FIXED',
          },
          blockers: [],
        },
      ],
    };
  } else {
    return {
      data: [
        {
          person: {
            id: '123',
            first_name: 'abc',
            last_name: 'cde',
          },
          employee_code: '123',
          blockers: [],
          office: {
            office_name: 'Office A',
            office_id: '1',
          },
        },
      ],
    };
  }
};

export const getPeopleError: PayrollIntegrationErrorResponse = {
  response: {
    data: {
      title: 'Could not retrieve data',
      detail: 'Error in retrieving data',
    },
  },
} as PayrollIntegrationErrorResponse;
