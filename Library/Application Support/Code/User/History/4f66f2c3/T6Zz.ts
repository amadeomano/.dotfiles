import {
  getGoferHandlers,
  validationError,
} from '@personio-web/gofer/query-mocking';
import {
  ListOrgUnitsHierarchyQueryResponse,
  ListOrgUnitsHierarchyQueryCustomResponse,
} from '../../mocks';

const documentIds = [
  'EO_ListOrgUnitsHierarchy_v20251022',
  'ListOrgUnitsHierarchy',
];

export const ListOrgUnitsHierarchyCustomHandlers = getGoferHandlers([
  {
    name: 'defaultHandler',
    documentIds: documentIds,
    response: ListOrgUnitsHierarchyQueryResponse,
  },
  {
    name: 'customHandler',
    documentIds: documentIds,
    response: ListOrgUnitsHierarchyQueryCustomResponse,
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
