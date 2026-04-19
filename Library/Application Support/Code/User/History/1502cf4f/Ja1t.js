// @ts-check

const { createDataModule } = require('./createDataModule');
const { createMocks } = require('./createMocks');
const { createTypes } = require('./createTypes');
const { getDataOptions } = require('./utils/getDataOptions');
const { getSchema } = require('./utils/getSchema');
const { validateSchema } = require('./utils/validateSchema');

/**
 * @type {import('@nx/devkit').Executor<import('./types').RequestSyncSchema>}
 */
const createRequests = async (options, context) => {
  const dataOptions = getDataOptions(context);

  const schema = await getSchema({
    serviceName: dataOptions.serviceName,
    context,
  });
  console.warn('CREATING', options.operation);

  switch (options.operation) {
    case 'validate':
      validateSchema({ schema });
      break;
    case 'mock':
      await createMocks({ schema, options: dataOptions, context });
      break;
    case 'type':
      await createTypes({ schema, options: dataOptions, context });
      break;
    case 'sync':
      await createDataModule({ schema, options: dataOptions, context });
      break;
  }

  return { success: true };
};

module.exports = createRequests;
