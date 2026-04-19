import { rest } from 'msw';
import {
  /* DO NOT DELETE - Auto generated type imports - Start */
  type ListLegalEntitiesHandlers,
  type ListLegalEntitiesBody,
  type HandlerListLegalEntitiesPathParams,
  type ListLegalEntitiesData,
  /* DO NOT DELETE - Auto generated type imports - End */
} from '@personio-web/employees-organizations-data-legal-entities-types';
import {
  /* DO NOT DELETE - Auto generated mock imports - Start */
  listLegalEntitiesData200Status,
  /* DO NOT DELETE - Auto generated mock imports - End */
} from '@personio-web/employees-organizations-mocks-legal-entities';

import {
  /* DO NOT DELETE - Auto generated API definitions - Start */
  listLegalEntitiesAPI,
  /* DO NOT DELETE - Auto generated API definitions - End */
} from '../common';

/* DO NOT DELETE - Auto generated handlers - Start */
const listLegalEntities200Handler = rest.get<
  ListLegalEntitiesBody,
  HandlerListLegalEntitiesPathParams,
  ListLegalEntitiesData
>(listLegalEntitiesAPI.API_PATH, (req, res, ctx) =>
  res(ctx.status(listLegalEntitiesData200Status)),
);
/* DO NOT DELETE - Auto generated handlers - End */

/* DO NOT DELETE - Auto generated handler export - Start */
export const listLegalEntitiesHandlers: ListLegalEntitiesHandlers = {
  defaultHandler: listLegalEntities200Handler,
  defaultHandlerTwo: listLegalEntities200Handler,
};
/* DO NOT DELETE - Auto generated handler export - End */
