import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type CreateCompensationHandlers,
  type CreateCompensationBody,
  type HandlerCreateCompensationPathParams,
  type CreateCompensationData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  createCompensationData201Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  createCompensationAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const createCompensation201Handler = rest.post<
  CreateCompensationBody,
  HandlerCreateCompensationPathParams,
  CreateCompensationData
>(createCompensationAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(createCompensationData201Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const createCompensationHandlers: CreateCompensationHandlers = {
  defaultHandler: createCompensation201Handler,
};
/* DO NOT DELETE - Auto generated handler export - End */
