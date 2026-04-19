import { InMemoryCache } from '@apollo/client/cache';
import { type DocumentNode, ApolloClient, from } from '@apollo/client/core';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { setContext } from '@apollo/client/link/context';
import { ApolloLink } from '@apollo/client/link/core';
import { createHttpLink } from '@apollo/client/link/http';
import { RetryLink } from '@apollo/client/link/retry';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import type { ASTNode } from 'graphql/language/ast';
import Cookies from '@personio-web/core-cookies';

import { getLocale } from '@personio-web/i18n';

import { persistentQueryMap } from './queries/persistentQueryMap';
import { GOFER_SERVICE_URL, IS_DEV } from './constants';

if (IS_DEV) {
  loadDevMessages();
  loadErrorMessages();
}

const getAuthHeaders = () => {
  const token = Cookies.getXSRFCookie();
  return {
    'x-xsrf-token': token,
    'X-CSRF-Token': token,
    'x-company-id': window?.COMPANY?.id,
    'X-Company-Id': window?.COMPANY?.id,
  };
};

const getAcceptLanguageHeaders = () => ({
  'Accept-Language': getLocale(),
});

const retryLink = new RetryLink();

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...getAuthHeaders(),
    ...getAcceptLanguageHeaders(),
  },
}));

const getPersistentOperationId = (document: DocumentNode) => {
  let operationName: string | null = null;
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition') {
      if (!definition.name) {
        throw new Error('Anonymous operations are not supported');
      }
      if (operationName !== null) {
        throw new Error('Multi-operation GraphQL documents are not supported');
      }
      operationName = definition.name.value;
    }
  }
  if (operationName === null) {
    throw new Error('Documents without operations are not supported');
  }
  const operationId = persistentQueryMap[operationName];
  if (operationId === undefined) {
    if (IS_DEV) {
      return operationName;
    }

    throw new Error(`Operation ${operationName} not found in manifest`);
  }
  return operationId;
};

const persistentQueryLink = createPersistedQueryLink({
  generateHash: getPersistentOperationId,
});

const persistentQueryContext = new ApolloLink((operation, forward) => {
  if (!IS_DEV) {
    // Replaces the operationName to avoid it being sent to the BE mismatching with the operation ID
    operation.operationName = persistentQueryMap[operation.operationName];
  }
  // Modify the createPersistedQueryLink behavior of omitting the query in the request
  operation.setContext({
    http: {
      includeExtensions: false,
      includeQuery: true,
    },
  });
  return forward(operation);
});

const httpLink = createHttpLink({
  uri: GOFER_SERVICE_URL,
  print(ast: ASTNode, originalPrint: (ast: ASTNode) => string) {
    if (!IS_DEV && ast.kind === 'Document') {
      return getPersistentOperationId(ast);
    }

    return originalPrint(ast);
  },
});

export const goferClient = new ApolloClient({
  link: from([
    retryLink,
    authLink,
    persistentQueryLink,
    persistentQueryContext,
    httpLink,
  ]),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development',
});
