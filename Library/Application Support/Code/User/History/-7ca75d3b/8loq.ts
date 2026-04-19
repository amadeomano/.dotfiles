import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type CreateEmployeePensionHandlers,
  type CreateEmployeePensionBody,
  type HandlerCreateEmployeePensionPathParams,
  type CreateEmployeePensionData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  createEmployeePensionData200Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  createEmployeePensionAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const createEmployeePension200Handler = rest.post<
  CreateEmployeePensionBody,
  HandlerCreateEmployeePensionPathParams,
  CreateEmployeePensionData
>(createEmployeePensionAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(createEmployeePensionData200Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const createEmployeePensionHandlers: CreateEmployeePensionHandlers = {
  defaultHandler: createEmployeePension200Handler,
};
/* DO NOT DELETE - Auto generated handler export - End */
