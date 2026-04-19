// @ts-check

const { joinPathFragments } = require('@nx/devkit');
const { getNames } = require('./getNames');
const { writeContent, readContent } = require('./writeContent');
const { formatPath } = require('./formatPath');
const { injectContent } = require('./injectContent');
const { extractPapiPath } = require('./extractPapiPath');

/**
 * @param {object} options
 * @param {import('openapi-typescript').OpenAPI3} options.schema
 * @param {import('../types').RequestSyncSchema} options.options
 * @param {import('@nx/devkit').ExecutorContext} options.context
 * @param {import('./getOperations').Operations} options.operations
 */
const buildCommon = ({ operations, context }) => {
  const apiItems = [];
  const importItems = [];
  const commonPath = joinPathFragments('src', 'common.ts');

  Object.entries(operations).forEach(([operationId, operation]) => {
    const names = getNames(operationId, context);

    importItems.push(`type ${names.api}`);

    const content = `export const ${names.apiReal}: ${names.api} = {
      API_PATH: '${formatPath(
        operation.path,
        context.target?.options.pathPrefix,
        extractPapiPath(operation),
      )}',
      METHOD: '${operation.method.toUpperCase()}',
      KEY: {
        service: '${operation.service}',
        operationId: '${operationId}',
      },
    };`;

    console.warn(
      'Pushed Common',
      formatPath(
        operation.path,
        context.target?.options.pathPrefix,
        extractPapiPath(operation),
      ),
    );

    apiItems.push(content);
  });

  const commonContent = readContent({ fileName: commonPath, context });

  const commonContentWithImports = injectContent(
    'imports',
    commonContent,
    importItems.join(',\n'),
  );

  const commonContentWithApis = injectContent(
    'API definitions',
    commonContentWithImports,
    apiItems.join('\n\n'),
  );

  writeContent({
    content: commonContentWithApis,
    fileName: commonPath,
    context,
  });
};

module.exports = {
  buildCommon,
};
