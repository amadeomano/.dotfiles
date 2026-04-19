import { graphql } from 'msw';

import type {
  ListPersonsByIdsQuery,
  ListPersonsByIdsQueryVariables,
} from '@personio-web/payroll-data-gofer-types';
import {
  listRandomPersonsByIds,
  listLegalEntity1943PersonsByIds,
  listEmptyPersonsById,
} from '@personio-web/payroll-mocks-gofer';

import { GOFER_SERVICE_URL } from '../constants';

const defaultHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<ListPersonsByIdsQuery, ListPersonsByIdsQueryVariables>(
    'ListPersonsByIds',
    (req, res, ctx) => res(ctx.data(listRandomPersonsByIds(req.variables))),
  );

const emptyHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<ListPersonsByIdsQuery, ListPersonsByIdsQueryVariables>(
    'ListPersonsByIds',
    (req, res, ctx) => res(ctx.data(listEmptyPersonsById())),
  );

export const listPersonsByIdsHandlers = {
  defaultHandler,
  emptyHandler,
};
