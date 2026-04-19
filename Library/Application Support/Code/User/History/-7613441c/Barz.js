// @ts-check

const { buildExamples } = require('./utils/buildExamples');
const { getOperations } = require('./utils/getOperations');
const { getTypes } = require('./utils/getTypes');
const { getOperationTypes } = require('./utils/getOperationTypes');
const { writeContent } = require('./utils/writeContent');
const { getExportTypes } = require('./utils/getExportTypes');
const { getHandlerTypes } = require('./utils/getHandlerTypes');
const { updateIndexDTs } = require('./utils/updateIndexDTs');
const { formatFiles } = require('./utils/formatFiles');

/**
 * @param {object} options
 * @param {import('openapi-typescript').OpenAPI3} options.schema
 * @param {import('./types').RequestSyncSchema} options.options
 * @param {import('@nx/devkit').ExecutorContext} options.context
 */
const createTypes = async ({ schema, options, context }) => {
  const types = await getTypes({ schema });

  writeContent({ content: types, fileName: 'schema.ts', context });

  const operations = getOperations({ schema, options });

  const operationTypes = getOperationTypes({
    operations,
    context,
    schema,
    options,
  });

  writeContent({ content: operationTypes, fileName: 'operations.ts', context });

  const examples = buildExamples({ schema, options, operations });

  const handlerTypes = getHandlerTypes({ operations, examples, context });

  writeContent({ content: handlerTypes, fileName: 'handlers.ts', context });

  const exportTypes = getExportTypes({ operations, context });

  const updatedIndexDTs = updateIndexDTs({ exportTypes, context });

  writeContent({ content: updatedIndexDTs, fileName: 'index.d.ts', context });

  await formatFiles();
};

module.exports = {
  createTypes,
};
