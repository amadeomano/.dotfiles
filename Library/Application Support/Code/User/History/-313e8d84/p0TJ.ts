import { rest } from 'msw';
import {
  getPeopleData,
  getPeopleError,
} from '@personio-web/payroll-mocks-payroll-integration-hub';
import {
  GetPeopleDataHandlers,
  PayrollIntegrationErrorResponse,
  PeopleDataAPI,
  PeopleDataResponse,
} from '../types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

const defaultHandler = rest.get<never, never, PeopleDataResponse>(
  PeopleDataAPI.API_PATH_PATTERN,
  (req, res, ctx) => {
    const integration: PayrollIntegration = req.params['integration'];
    return res(ctx.status(200), ctx.json(getPeopleData(integration)));
  },
);

const errorHandler = rest.get<never, never, PayrollIntegrationErrorResponse>(
  PeopleDataAPI.API_PATH_PATTERN,
  (req, res, ctx) => res(ctx.status(500), ctx.json(getPeopleError)),
);

export const getPeopleDataHandlers: GetPeopleDataHandlers = {
  defaultHandler,
  errorHandler,
};
