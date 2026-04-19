import { isOperationDefinition, isPersistedDocument } from './utils';

import { type MaybePersistedTypedDocument } from '../types/document';

/**
 * Get the operation name from a document
 */
export const getOperationName = <TData, TVariables>(
  document: MaybePersistedTypedDocument<TData, TVariables>,
) => {
  if (isPersistedDocument(document)) {
    return document.documentId;
  }
  const { definitions } = document;

  const operationName: string =
    definitions.filter(isOperationDefinition)[0]?.name?.value ?? '';

  console.log('[] opName', operationName);
  if (!operationName) {
    throw new Error('Documents without operations are not supported');
  }
  return operationName;
};
