import type { Config } from 'jest';

const config: Config = {
  displayName: 'payroll-feature-integration-people-table',
  preset: '@personio-web/config-jest',
  coverageThreshold: {
    global: {
      branches: 83,
      functions: 86.13,
      lines: 79.82,
      statements: 80.33,
    },
  },
};

export default config;
