import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type UpdateLegalEntityDataHandlers,
  type UpdateLegalEntityDataBody,
  type HandlerUpdateLegalEntityDataPathParams,
  type UpdateLegalEntityDataData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/payroll-data-payroll-me-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  updateLegalEntityDataData204Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/payroll-mocks-payroll-me';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  updateLegalEntityDataAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const updateLegalEntityData204Handler = rest.put<
  UpdateLegalEntityDataBody,
  HandlerUpdateLegalEntityDataPathParams,
  UpdateLegalEntityDataData
>(updateLegalEntityDataAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(updateLegalEntityDataData204Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const updateLegalEntityDataHandlers: UpdateLegalEntityDataHandlers = {
  defaultHandler: updateLegalEntityData204Handler,
};
/* DO NOT DELETE - Auto generated handler export - End */
