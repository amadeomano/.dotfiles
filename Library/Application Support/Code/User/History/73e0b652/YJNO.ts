import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type CreateDefaultSchemasHandlers,
  type CreateDefaultSchemasBody,
  type HandlerCreateDefaultSchemasPathParams,
  type CreateDefaultSchemasData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  createDefaultSchemasData204Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  createDefaultSchemasAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const createDefaultSchemas204Handler = rest.post<
  CreateDefaultSchemasBody,
  HandlerCreateDefaultSchemasPathParams,
  CreateDefaultSchemasData
>(createDefaultSchemasAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(createDefaultSchemasData204Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const createDefaultSchemasHandlers: CreateDefaultSchemasHandlers = {
  defaultHandler: createDefaultSchemas204Handler,
};
/* DO NOT DELETE - Auto generated handler export - End */
