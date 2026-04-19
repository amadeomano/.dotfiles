import { graphql } from 'msw';

import type {
  ListPersonsByIdsQuery,
  ListPersonsByIdsQueryVariables,
} from '@personio-web/payroll-data-gofer-types';
import {
  listLegalEntity1943PersonsById,
  listEmptyPersonsById,
} from '@personio-web/payroll-mocks-gofer';

import { GOFER_SERVICE_URL } from '../constants';

const defaultHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<ListPersonsByIdsQuery, ListPersonsByIdsQueryVariables>(
    'ListPersonsByIds',
    (req, res, ctx) =>
      res(ctx.data(listLegalEntity1943PersonsById(req.variables))),
  );

const emptyHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<ListPersonsByIdsQuery, ListPersonsByIdsQueryVariables>(
    'ListPersonsByIds',
    (req, res, ctx) => res(ctx.data(listEmptyPersonsById(req.variables))),
  );

export const listEmploymentsByPersonIdsHandlers = {
  defaultHandler,
  emptyHandler,
};
