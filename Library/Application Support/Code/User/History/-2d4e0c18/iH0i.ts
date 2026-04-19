import { rest } from 'msw';
import {
  postTransferData,
  postTransferError,
} from '@personio-web/payroll-mocks-payroll-integration-hub';
import { PostTransferEmployeesAPI } from '../types';
import {
  PostTransferDataErrorResponse,
  PostTransferDataHandlers,
  PostTransferDataResponse,
} from '@personio-web/payroll-data-payroll-integration-hub-types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

const defaultHandler = rest.post<never, never, PostTransferDataResponse>(
  PostTransferEmployeesAPI.API_PATH,
  async (req, res, ctx) => {
    const body = await req.json();
    const integration: PayrollIntegration = body['integration'];
    return res(
      ctx.delay(100),
      ctx.status(200),
      ctx.json(postTransferData(integration)),
    );
  },
);

const errorHandler = rest.post<never, never, PostTransferDataErrorResponse>(
  PostTransferEmployeesAPI.API_PATH,
  (req, res, ctx) => res(ctx.status(400), ctx.json(postTransferError)),
);

export const postTransferDataHandlers: PostTransferDataHandlers = {
  defaultHandler,
  errorHandler,
};
