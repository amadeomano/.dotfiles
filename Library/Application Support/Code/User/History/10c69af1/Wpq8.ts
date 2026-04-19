import type { Arrayable } from 'type-fest';
import type { TadaDocumentNode, TadaPersistedDocumentNode } from 'gql.tada';

export type ScalarVariables = {
  [key: string]:
    | Arrayable<string>
    | Arrayable<boolean>
    | Arrayable<number>
    | null
    | ScalarVariables;
  pageToken?: unknown;
};

export type MaybePersistedTypedDocument<
  TData = never,
  TVariables = ScalarVariables,
> =
  | TadaDocumentNode<TData, TVariables>
  | TadaPersistedDocumentNode<TData, TVariables>;

export type GraphQlOperationType = 'query' | 'mutation';
