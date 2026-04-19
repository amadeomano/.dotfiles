// @ts-check

const { getNames } = require('./getNames');
const { formatPath } = require('./formatPath');
const { extractPapiPath } = require('./extractPapiPath');

/**
 * @param {object} options
 * @param {import('./getOperations').Operations} options.operations
 * @param {import('@nx/devkit').ExecutorContext} options.context
 */
const getOperationTypes = ({ operations, context }) => {
  const operationTypes = [];

  Object.entries(operations).forEach(([operationId, operation]) => {
    operationTypes.push(`// ${operationId}`);

    const names = getNames(operationId, context);

    operationTypes.push(
      [
        `export type ${names.pathParams} =`,
        operation.hasPathParams
          ? `import('./schema.ts').operations['${operationId}']['parameters']['path']`
          : 'never',
      ].join(' '),
      `export type ${names.handlerPathParams} = NormalizeParams<${names.pathParams}>;`,
    );

    operationTypes.push(
      [
        `export type ${names.query} =`,
        operation.hasQuery
          ? `import('./schema.ts').operations['${operationId}']['parameters']['query']`
          : 'never',
      ].join(' '),
    );

    operationTypes.push(
      [
        `export type ${names.headers} =`,
        operation.hasHeaders
          ? `import('./schema.ts').operations['${operationId}']['parameters']['header']`
          : 'never',
      ].join(' '),
    );

    operationTypes.push(
      [
        `export type ${names.body} =`,
        operation.hasRequestBody
          ? `NonNullable<import('./schema.ts').operations['${operationId}']['requestBody']>['content']['application/json']`
          : 'never',
      ].join(' '),
    );

    const handled200 = [];
    const handledNon200 = [];

    for (const [status, response] of Object.entries(
      operation.definition.responses || {},
    )) {
      if (typeof response === 'object' && '$ref' in response) {
        continue;
      }

      const statusCode = parseInt(status);

      const responseType =
        Object.keys(response?.content || {})[0] || 'application/json';

      if (statusCode >= 200 && statusCode < 300) {
        operationTypes.push(
          [
            `export type ${names.data}${statusCode} =`,
            response.content
              ? `import('./schema.ts').operations['${operationId}']['responses'][${statusCode}]['content']['${responseType}']`
              : 'undefined',
          ].join(' '),
        );

        handled200.push(statusCode);
      } else {
        operationTypes.push(
          [
            `export type ${names.errorResponse}${statusCode} =`,
            response.content
              ? `import('./schema.ts').operations['${operationId}']['responses'][${statusCode}]['content']['${responseType}']`
              : 'never',
          ].join(' '),
        );

        handledNon200.push(statusCode);
      }
    }

    if (handled200.length) {
      operationTypes.push(
        [
          `export type ${names.data} =`,
          handled200
            .map((statusCode) => `${names.data}${statusCode}`)
            .join('|'),
        ].join(' '),
        [
          `export type ${names.dataResponse} =`,
          `{ data: ${names.data} };`,
        ].join(' '),
      );
    } else {
      operationTypes.push(`export type ${names.data} = never;`);
      operationTypes.push(`export type ${names.dataResponse} = never;`);
    }

    if (handledNon200.length) {
      operationTypes.push(
        [
          `export type ${names.errorResponse} = `,
          handledNon200
            .map((statusCode) => `${names.errorResponse}${statusCode}`)
            .join('|'),
        ].join(' '),
      );
    } else {
      operationTypes.push(`export type ${names.errorResponse} = never;`);
    }

    console.warn('PUSHING');
    operationTypes.push(
      `export type ${names.api} = {
        API_PATH: '${formatPath(
          operation.path,
          context.target?.options.pathPrefix,
          extractPapiPath(operation),
        )}';
        METHOD: '${operation.method.toUpperCase()}';
        KEY: {
          service: '${operation.service}';
          operationId: '${operationId}';
        };
      };`,
    );

    const key = [`${names.api}['KEY']`];
    const optionsProps = [];

    if (operation.hasPathParams) {
      key.push(names.pathParams);
      optionsProps.push(`pathParams: ${names.pathParams};`);
    }

    if (operation.hasRequestBody) {
      key.push(names.body);
      optionsProps.push(`data: ${names.body};`);
    }

    if (operation.hasQuery) {
      if (operation.queryRequired) {
        key.push(`${names.query}`);
        optionsProps.push(`params: ${names.query};`);
      } else {
        key.push(`${names.query} | undefined`);
        optionsProps.push(`params: ${names.query} | undefined;`);
      }
    }

    if (operation.hasHeaders) {
      key.push(names.headers);
      optionsProps.push(`headers: ${names.headers};`);
    }

    const options = optionsProps.length
      ? `options: { ${optionsProps.join('\n')} }`
      : '';

    operationTypes.push(
      `export type ${names.request} = (${options}) => Promise<${names.data}>;`,
    );

    if (operation.method === 'get') {
      operationTypes.push(
        `export type ${names.key} = [
          ${key.join(',')}
        ];`,
      );

      const options = [`select?: (data: ${names.data}) => Selection;`];

      if (operation.hasPathParams) {
        options.push(`requestPathParams: ${names.pathParams};`);
      }

      if (operation.hasRequestBody) {
        options.push(`requestBody: ${names.body};`);
      }

      if (operation.hasQuery) {
        options.push(
          `requestQuery${operation.queryRequired ? '' : '?'}: ${names.query};`,
        );
      }

      if (operation.hasHeaders) {
        options.push(`requestHeaders: ${names.headers};`);
      }

      operationTypes.push(
        `export type ${names.options}<Selection = ${names.data}> =
          import('react-query').UseQueryOptions<
            ${names.data},
            AxiosError<${names.errorResponse}>,
            Selection,
            import('react-query').EnsuredQueryKey<${names.key}>
          > & {
            ${options.join('')}
          };`,
      );

      const optionalOptions = !operation.hasOptions ? '?' : '';

      operationTypes.push(
        `export type ${names.hook} = <Selection = ${names.data}>(
          options${optionalOptions}: ${names.options}<Selection>,
        ) => import('react-query').UseQueryResult<
          Selection,
          AxiosError<${names.errorResponse}>
        >;`,
      );
    } else {
      const hookContext = [];

      if (operation.hasPathParams) {
        hookContext.push(`requestPathParams: ${names.pathParams};`);
      }

      if (operation.hasRequestBody) {
        hookContext.push(`requestBody: ${names.body};`);
      }

      if (operation.hasQuery) {
        if (operation.queryRequired) {
          hookContext.push(`requestQuery: ${names.query};`);
        } else {
          hookContext.push(`requestQuery?: ${names.query};`);
        }
      }

      if (operation.hasHeaders) {
        hookContext.push(`requestHeaders: ${names.headers};`);
      }

      operationTypes.push(
        `export type ${names.key} = [
          ${names.api}['KEY']
        ];`,
      );

      operationTypes.push(
        `export type ${names.options} =
        import('react-query').UseMutationOptions<
        ${names.data},
        AxiosError<${names.errorResponse}>,
        ${hookContext.length ? `{${hookContext.join('')}}` : 'void'},
        >;`,
      );

      operationTypes.push(`export type ${names.hook} = (
          options?: ${names.options},
        ) => import('react-query').UseMutationResult<
        ${names.data},
          AxiosError<${names.errorResponse}>,
          ${hookContext.length ? `{${hookContext.join('')}}` : 'void'},
        >;`);
    }
  });

  const contents = [
    `/**
    * DO NOT MODIFY THIS FILE
    * This file in generated automatically by the @personio-web/nx-request-sync executor
    */`,
    `import type { AxiosError } from 'axios';`,
    `type NormalizeParams<T> = {
      [K in keyof T]: T[K] extends number ? string : T[K];
    };`,
    ...operationTypes,
  ];
  return contents.join('\n\n');
};

module.exports = {
  getOperationTypes,
};
