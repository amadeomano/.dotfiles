import type { TadaDocumentNode, TadaPersistedDocumentNode } from 'gql.tada';

type Arrayable<T> = T | T[];
export type ScalarVariables = {
  [key: string]: Arrayable<string> | Arrayable<boolean> | Arrayable<number> | null | ScalarVariables;
};

export type MaybePersistedTypedDocument<
  TData = never,
  TVariables = ScalarVariables,
> =
  | TadaDocumentNode<TData, TVariables>
  | TadaPersistedDocumentNode<TData, TVariables>;

export type GraphQlOperationType = 'query' | 'mutation';
