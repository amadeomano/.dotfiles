import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type CreateEmployerCompensationSchemaHandlers,
  type CreateEmployerCompensationSchemaBody,
  type HandlerCreateEmployerCompensationSchemaPathParams,
  type CreateEmployerCompensationSchemaData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  createEmployerCompensationSchemaData201Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  createEmployerCompensationSchemaAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const createEmployerCompensationSchema201Handler = rest.post<
  CreateEmployerCompensationSchemaBody,
  HandlerCreateEmployerCompensationSchemaPathParams,
  CreateEmployerCompensationSchemaData
>(createEmployerCompensationSchemaAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(createEmployerCompensationSchemaData201Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const createEmployerCompensationSchemaHandlers: CreateEmployerCompensationSchemaHandlers =
  {
    defaultHandler: createEmployerCompensationSchema201Handler,
  };
/* DO NOT DELETE - Auto generated handler export - End */
