import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type CreateEmployerPensionSchemeHandlers,
  type CreateEmployerPensionSchemeBody,
  type HandlerCreateEmployerPensionSchemePathParams,
  type CreateEmployerPensionSchemeData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  createEmployerPensionSchemeData200Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  createEmployerPensionSchemeAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const createEmployerPensionScheme200Handler = rest.post<
  CreateEmployerPensionSchemeBody,
  HandlerCreateEmployerPensionSchemePathParams,
  CreateEmployerPensionSchemeData
>(createEmployerPensionSchemeAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(createEmployerPensionSchemeData200Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const createEmployerPensionSchemeHandlers: CreateEmployerPensionSchemeHandlers =
  {
    defaultHandler: createEmployerPensionScheme200Handler,
  };
/* DO NOT DELETE - Auto generated handler export - End */
