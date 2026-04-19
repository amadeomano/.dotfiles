import { type TadaDocumentNode } from 'gql.tada';
import { type DocumentNode } from 'graphql/language';
import request from '@personio-web/request';

import { GOFER_SERVICE_URL } from '../constants';
import { getTransportBody } from './utils/getTransportBody';
import { type GraphQLResponse } from '../types/query';
import {
  type ScalarVariables,
  type GraphQlOperationType,
} from '../types/document';

type GoferRequestOptions<TVariables extends ScalarVariables> = {
  operationType?: GraphQlOperationType;
  companyId: number;
  variables?: TVariables;
};

export function goferRequest<
  TData = never,
  TVariables extends ScalarVariables = ScalarVariables,
>({
  operation,
  options,
}: {
  operation: TadaDocumentNode<TData, TVariables>;
  options: GoferRequestOptions<TVariables>;
}): Promise<GraphQLResponse<TData>>;

/**
 * Sends a GraphQL request to the Gofer service and returns the response data or errors.
 */
export async function goferRequest<
  TData = never,
  TVariables = Record<string, never>,
>({
  operation,
  options,
}: {
  operation: DocumentNode;
  options: GoferRequestOptions<TVariables>;
}): Promise<GraphQLResponse<TData>> {
  const { companyId, variables } = options;

  const response = await request.post(
    GOFER_SERVICE_URL,
    getTransportBody({ operation, variables }),
    {
      headers: {
        'content-type': 'application/json',
        'x-company-id': companyId.toString(),
      },
    },
  );
  const { data, errors } = await response.data;

  return { data, errors };
}
