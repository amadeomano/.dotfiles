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
      statements: 95,
      branches: 84.31,
      lines: 95,
      functions: 92,
    },
  },
};

export default config;
