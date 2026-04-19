import {
  ApiError,
  PayrollIntegrationErrorResponse,
} from '@personio-web/payroll-data-payroll-integration-oauth-types';
import { AxiosError } from 'axios';
import {
  A3ContextRaw,
  PayrollContextRaw,
  PayrollContextResponse,
  XeroContextRaw,
} from '@personio-web/payroll-data-payroll-integration-context-types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';
import { cloneDeep } from 'lodash';

const SHARED_DEFAULT_CONTEXT: PayrollContextRaw = {
  is_authorized: true,
  execution_context: {
    last_successfully_used: '2024-01-27T21:03:18.678Z',
  },
};
const XERO_DEFAULT_CONTEXT: XeroContextRaw = {
  ...SHARED_DEFAULT_CONTEXT,
  xero_context: {
    transfer: {
      state: 'READY',
      result: {
        created_employee_ids: ['1', '2', '3', '4'],
        updated_employee_ids: ['5', '6', '7', '8'],
        not_created_employee_ids: [],
        not_updated_employee_ids: [],
        blocking_errors: [],
        failures: {},
        emails_to_display: [],
      },
      last_triggered: '2024-01-27T21:03:18.678Z',
    },
    redirect_urls: {
      pay_run_overview: 'https://payroll.xero.com/PayRun?CID=!5pwp!',
    },
    settings: {
      pay_periods: {
        grouping_by_attribute: {
          label: 'Salary Type',
          universal_id: 'salary_type',
        },
        grouping_active: true,
        mappings: [
          {
            attribute: {
              label: 'Fixed Salary',
              value: 'fixed_salary',
            },
            calendar: {
              id: 'dab52ac9-fe78-43cb-9876-4c54056847ea',
              name: 'MONTHLY',
              frequency: 'monthly',
              next_pay_period: {
                from: '2024-02-01',
                to: '2024-02-29',
              },
              next_pay_day: '2024-02-29',
            },
          },
        ],
        calendar: undefined,
      },
    },
  },
};

const A3_DEFAULT_CONTEXT: A3ContextRaw = {
  ...SHARED_DEFAULT_CONTEXT,
  a3_context: {
    settings: {
      no_company_mapped: false,
      no_workplace_mapped: false,
    },
    current_pay_period: {
      from: '2024-02-01',
      to: '2024-02-29',
    },
  },
};

export const getPayrollContext = (
  integration: PayrollIntegration,
): PayrollContextResponse => {
  if (integration === 'xero') {
    return {
      data: XERO_DEFAULT_CONTEXT,
    };
  } else {
    return {
      data: A3_DEFAULT_CONTEXT,
    };
  }
};

export const getPayrollContextUnauthorized = (
  integration: PayrollIntegration,
): PayrollContextResponse => {
  const response = getPayrollContext(integration);
  response.data.is_authorized = false;
  return response;
};

export const getXeroContextTransferNotAllowed = (): PayrollContextResponse => {
  const data = cloneDeep(XERO_DEFAULT_CONTEXT);
  data.xero_context!.transfer.state = 'PAY_RUN_DRAFT_EXISTS';

  return { data };
};

export const getXeroContextNoGroupingNoCalendar =
  (): PayrollContextResponse => {
    const data = cloneDeep(XERO_DEFAULT_CONTEXT);
    data.xero_context!.settings.pay_periods.grouping_active = false;
    data.xero_context!.settings.pay_periods.calendar = undefined;

    return { data };
  };

export const getXeroContextGroupingNoCalendar = (): PayrollContextResponse => {
  const data = cloneDeep(XERO_DEFAULT_CONTEXT);
  data.xero_context!.settings.pay_periods.grouping_active = true;
  data.xero_context!.settings.pay_periods.mappings[0].calendar = undefined;

  return { data };
};

export const getPayrollContextError: PayrollIntegrationErrorResponse = {
  response: {
    data: {
      title: 'Could not retrieve data',
      detail: 'Could not retrieve data',
    },
  },
} as AxiosError<ApiError>;
