import { type ScalarVariables } from "../src/types/document";
import {
  rest,
  type RestHandler
} from "msw";
import { GOFER_SERVICE_URL } from "../src/constants";
import { type GoferError } from "../src/types/errors";
import { type RequireExactlyOne } from "type-fest";
import { matchesDocumentId, type StringOrRegExp } from "./matchesDocumentId";
import { type TadaDocumentNode } from "gql.tada";
import { graphql } from "../src/gofer";

type ResponseObject = {
  data?: object;
  errors?: GoferError[];
};

type ResponseDetails = {
  response?: ResponseQueryFunction | ResponseObject;
  httpErrorStatus?: number;
}

type ResponseOrIsHttpError = RequireExactlyOne<ResponseDetails, "response" | "httpErrorStatus">;

type ResponseQueryFunction = ({
                                query,
                                variables,
                                document
                              }: {
  query?: string;
  variables?: ScalarVariables;
  document?: TadaDocumentNode
}) => ResponseObject | undefined;

type HandlerDefinition<Name extends string = string> = {
  name: Name;
  documentIds: StringOrRegExp | StringOrRegExp[];
  delay?: number;
} & ResponseOrIsHttpError;

type RequiredDefaultHandler = HandlerDefinition & {
  name: "defaultHandler"
}

type ExtractHandlerNames<T> = T extends { name: infer Name }[]
  ? Name extends string
    ? Name
    : never
  : never;


type HandlersObject<T extends HandlerDefinition[]> = Record<ExtractHandlerNames<T>, RestHandler>;

type HandlerDefinitionsWithRequiredDefaultHandler = [RequiredDefaultHandler, ...HandlerDefinition[]];

/**
 * Given an array of handler definitions, returns an object of MSW handlers for
 * graphql queries. Note that the first item in the array must have the name defaultHandler.
 *
 *
 * @example Usage, will create and object with defaultHandler and graphqlErrorHandler:
 * export const getPersonBaseDataHandlers = getGoferHandlers([
 *   {
 *     name: 'defaultHandler',
 *     documentIds: ['GetPersonBaseData', /^EmployeeHoverCard/],
 *     response: PersonBaseDataQueryResponse,
 *   },
 *   {
 *     name: 'graphqlErrorHandler',
 *     documentIds: ['GetPersonBaseData', /^EmployeeHoverCard/],
 *     response: { errors: [validationError] },
 *   },
 * ]);
 */
// const type params not supported until Prettier 3.2.5
// prettier-ignore
// eslint-disable-next-line prettier/prettier
export const getGoferHandlers = <const T extends HandlerDefinitionsWithRequiredDefaultHandler>(
  definitions: T & HandlerDefinition[]
): HandlersObject<T> =>
  Object.fromEntries(
    definitions.map(
      ({ name, documentIds, response, httpErrorStatus, delay = 0 }) => {
        const restHandler = rest.post(
          GOFER_SERVICE_URL,
          async (req, res, ctx) => {
            const { query, variables } = await req.json();
            if (!query) return;

            if (matchesDocumentId(query, documentIds)) {
              if (httpErrorStatus) {
                return res(ctx.status(httpErrorStatus));
              }
              if (response instanceof Function) {
                const r = response({ query, variables, document: graphql(query) })
                console.log('[] response is a function for: ', name, r);
                return res(ctx.delay(delay), ctx.json(response({ query, variables, document: graphql(query) })));
              } else {
                return res(ctx.delay(delay), ctx.json(response));
              }
            }
          }
        );
        return [name, restHandler];
      }
    )
  ) as HandlersObject<T>; // needed until TS 5.5

export { validationError } from "../src/__mocks__/errors/validationError";
