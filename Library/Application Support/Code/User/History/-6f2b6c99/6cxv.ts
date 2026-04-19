import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  verbose: true,
  schema: 'schema.graphql',
  documents: ['src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './src/hooks/index.ts': {
      preset: 'import-types',
      presetConfig: {
        typesPath: '@personio-web/payroll-data-gofer',
      },
      plugins: ['typescript-react-apollo'],
      config: {
        withResultType: false,
        withMutationOptionsType: false,
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
