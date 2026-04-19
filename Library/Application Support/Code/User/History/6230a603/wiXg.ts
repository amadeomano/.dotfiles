import { log } from 'console';
import {
  getGoferHandlers,
  validationError,
  type HandlerDefinition,
} from '@personio-web/gofer/query-mocking';
import { ListEmploymentsByPersonIdsQueryResponse } from '../../mocks';

const documentIds = [
  'EO_ListEmploymentsByPersonIds_v2024112801',
  'ListEmploymentsByPersonIds',
];

type Handler = HandlerDefinition['response'];

const handler: Handler = ({ variables }) => {
  console.debug('[] handling', variables);
  // return ListEmploymentsByPersonIdsQueryResponse;
  return {};
};

export const ListEmploymentsByPersonIdsHandlers = getGoferHandlers([
  {
    name: 'defaultHandler',
    documentIds: documentIds,
    response: handler,
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
