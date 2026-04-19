import type { Config } from 'jest';

const config: Config = {
  displayName: 'employees-organizations-feature-org-chart',
  preset: '@personio-web/config-jest/swc',
  setupFilesAfterEnv: ['<rootDir>/test-setup/setupJestAfterEnv.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!d3)'],
  coveragePathIgnorePatterns: [
    '/__mocks__/',
    '/test-setup/',
    '/node_modules/',
    '/mocking/',
  ],
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 81,
      lines: 94,
      functions: 90,
    },
  },
};

export default config;
