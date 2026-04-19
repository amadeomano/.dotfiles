import { rest } from 'msw';
import {
  getPayrollContext,
  getPayrollContextError,
  getPayrollContextUnauthorized,
  getXeroContextGroupingNoCalendar,
  getXeroContextNoGroupingNoCalendar,
  getXeroContextTransferNotAllowed,
} from '@personio-web/payroll-mocks-payroll-integration-context';
import { PayrollIntegrationContextAPI } from '../types';
import {
  GetPayrollContextHandlers,
  PayrollContextErrorResponse,
  PayrollContextResponse,
} from '@personio-web/payroll-data-payroll-integration-context-types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

const defaultHandler = rest.get<never, never, PayrollContextResponse>(
  PayrollIntegrationContextAPI.API_PATH_PATTERN,
  (req, res, ctx) => {
    const integration: PayrollIntegration = req.params['integration'];
    return res(ctx.status(200), ctx.json(getPayrollContext(integration)));
  },
);

const defaultUnauthorizedHandler = rest.get<
  never,
  never,
  PayrollContextResponse
>(PayrollIntegrationContextAPI.API_PATH_PATTERN, (req, res, ctx) => {
  const integration: PayrollIntegration = req.params['integration'];
  return res(
    ctx.status(200),
    ctx.json(getPayrollContextUnauthorized(integration)),
  );
});

const xeroContextTransferNotAllowedHandler = rest.get<
  never,
  never,
  PayrollContextResponse
>(PayrollIntegrationContextAPI.API_PATH_PATTERN, (req, res, ctx) =>
  res(ctx.status(200), ctx.json(getXeroContextTransferNotAllowed())),
);

const xeroContextNoGroupingNoCalendarHandler = rest.get<
  never,
  never,
  PayrollContextResponse
>(PayrollIntegrationContextAPI.API_PATH_PATTERN, (req, res, ctx) =>
  res(ctx.status(200), ctx.json(getXeroContextNoGroupingNoCalendar())),
);

const xeroContextGroupingNoCalendarHandler = rest.get<
  never,
  never,
  PayrollContextResponse
>(PayrollIntegrationContextAPI.API_PATH_PATTERN, (req, res, ctx) =>
  res(ctx.status(200), ctx.json(getXeroContextGroupingNoCalendar())),
);

const errorHandler = rest.get<never, never, PayrollContextErrorResponse>(
  PayrollIntegrationContextAPI.API_PATH_PATTERN,
  (req, res, ctx) => res(ctx.status(404), ctx.json(getPayrollContextError)),
);

export const getPayrollContextHandlers: GetPayrollContextHandlers = {
  defaultHandler,
  defaultUnauthorizedHandler,
  xeroContextTransferNotAllowedHandler,
  xeroContextNoGroupingNoCalendarHandler,
  xeroContextGroupingNoCalendarHandler,
  errorHandler,
};
