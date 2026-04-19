import {
  getGoferHandlers,
  validationError,
} from '@personio-web/gofer/query-mocking';
import { listEmploymentsByPersonIdsResponse } from '../mocks';

const documentIds = [
  'EO_ListEmploymentsByPersonIds_v2024112801',
  'ListEmploymentsByPersonIds',
];

export const ListEmploymentsByPersonIdsHandlers = getGoferHandlers([
  {
    name: 'defaultHandler',
    documentIds: documentIds,
    response: ListEmploymentsByPersonIdsQueryResponse,
  },
  {
    name: 'graphqlErrorHandler',
    documentIds: documentIds,
    response: { errors: [validationError] },
  },
  {
    name: 'httpErrorHandler',
    documentIds: documentIds,
    httpErrorStatus: 500,
  },
]);
