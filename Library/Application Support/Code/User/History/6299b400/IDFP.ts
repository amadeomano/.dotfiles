import {
  PayrollIntegrationErrorResponse,
  PostTransferDataResponse,
  XeroTransferResultRaw,
} from '@personio-web/payroll-data-payroll-integration-hub';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
import { A3TransferResultRaw } from '@personio-web/payroll-data-payroll-integration-hub-types';

export const postTransferData = (
  integration: PayrollIntegration,
): PostTransferDataResponse => {
  if (integration === 'xero') {
    const transferResult: XeroTransferResultRaw = {
      created_employee_ids: ['1', '2', '3', '4'],
      updated_employee_ids: ['5', '6', '7', '8'],
      not_created_employee_ids: [],
      not_updated_employee_ids: [],
      blocking_errors: [],
      failures: {},
      emails_to_display: [],
    };
    return { data: transferResult };
  } else {
    const transferResult: A3TransferResultRaw = {
      created_employee_ids: ['11', '22', '33', '44'],
      updated_employee_ids: ['55', '66', '77', '88'],
      not_created_employee_ids: [],
      not_updated_employee_ids: [],
      blocking_errors: [],
      failures: {},
    };
    return { data: transferResult };
  }
};

export const postTransferError: PayrollIntegrationErrorResponse = {
  response: {
    data: {
      title: 'Could not retrieve data',
      detail: 'Error in retrieving data',
    },
  },
} as PayrollIntegrationErrorResponse;
