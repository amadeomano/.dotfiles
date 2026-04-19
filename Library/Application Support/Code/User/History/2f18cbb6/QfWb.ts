import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type ApprovePayrollRunHandlers,
  type ApprovePayrollRunBody,
  type HandlerApprovePayrollRunPathParams,
  type ApprovePayrollRunData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  approvePayrollRunData200Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  approvePayrollRunAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const approvePayrollRun200Handler = rest.post<
  ApprovePayrollRunBody,
  HandlerApprovePayrollRunPathParams,
  ApprovePayrollRunData
>(approvePayrollRunAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(approvePayrollRunData200Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const approvePayrollRunHandlers: ApprovePayrollRunHandlers = {
  defaultHandler: approvePayrollRun200Handler,
};
/* DO NOT DELETE - Auto generated handler export - End */
