import type { Config } from 'jest';

const config: Config = {
  displayName: 'payroll-data-gofer',
  preset: '@personio-web/config-jest',
  setupFilesAfterEnv: ['<rootDir>/testSetup/setupJestAfterEnv.ts'],
  coveragePathIgnorePatterns: [
    '/codegen.ts',
    'index.ts',
    '/src/constants',
    '/src/handlers',
    '/src/hooks',
    '/src/queries/persistentQueryMap.ts',
    '/src/client.ts',
    '/node_modules/',
  ],
};

export default config;
