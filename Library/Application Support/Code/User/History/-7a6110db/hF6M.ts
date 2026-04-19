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
  .query<
    ListEmploymentsByPersonIdsQuery,
    ListEmploymentsByPersonIdsQueryVariables
  >('ListEmploymentsByPersonIds', (req, res, ctx) =>
    res(ctx.data(listEmploymentsByPersonIdsResponse(req.variables))),
  );

const emptyHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<
    ListEmploymentsByPersonIdsQuery,
    ListEmploymentsByPersonIdsQueryVariables
  >('ListEmploymentsByPersonIds', (req, res, ctx) =>
    res(ctx.data(listEmptyEmploymentsByPersonIdsResponse(req.variables))),
  );

const inaccessibleHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<
    ListEmploymentsByPersonIdsQuery,
    ListEmploymentsByPersonIdsQueryVariables
  >('ListEmploymentsByPersonIds', (_, res, ctx) =>
    res(ctx.data(listInaccessibleEmploymentsByPersonIdsResponse)),
  );

const loadingHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<
    ListEmploymentsByPersonIdsQuery,
    ListEmploymentsByPersonIdsQueryVariables
  >('ListEmploymentsByPersonIds', (_, res, ctx) => res(ctx.delay('infinite')));

const errorHandler = graphql
  .link(GOFER_SERVICE_URL)
  .query<
    ListEmploymentsByPersonIdsQuery,
    ListEmploymentsByPersonIdsQueryVariables
  >('ListEmploymentsByPersonIds', (_, res, ctx) =>
    res(
      ctx.errors([
        {
          message: 'Server error',
        },
      ]),
    ),
  );

export const listEmploymentsByPersonIdsHandlers = {
  defaultHandler,
  emptyHandler,
  inaccessibleHandler,
  loadingHandler,
  errorHandler,
};
