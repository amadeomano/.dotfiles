import {
  getGoferHandlers,
  validationError,
} from '@personio-web/gofer/query-mocking';
import { ListEmploymentsByPersonIdsHandlers as Generated } from './generated/ListEmploymentsByPersonIdsHandlers';
import { listEmploymentsByPersonIdsResponse } from '../mocks';

const documentIds = [
  'EO_ListEmploymentsByPersonIds_v2024112801',
  'ListEmploymentsByPersonIds',
];

export const ListEmploymentsByPersonIdsHandlers = {
  ...Generated,
  ...getGoferHandlers([
    {
      name: 'defaultHandler',
      documentIds: documentIds,
      response: listEmploymentsByPersonIdsResponse,
    },
  ]),
};
