import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  verbose: true,
  schema: '../../../data/gofer/schema.graphql',
  documents: ['../../../data/gofer/src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './schema.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true,
        defaultScalarType: 'string',
        nonOptionalTypename: true,
      },
    },
    './operations.ts': {
      preset: 'import-types',
      presetConfig: {
        typesPath: './schema',
      },
      plugins: ['typescript-operations', 'named-operations-object'],
      config: {
        addOperationExport: true,
        useTypeImports: true,
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
