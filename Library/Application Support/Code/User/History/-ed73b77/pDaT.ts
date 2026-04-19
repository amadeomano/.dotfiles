import type { Config } from 'jest';

const config: Config = {
  displayName: 'payroll-component-payroll-layout',
  preset: '@personio-web/config-jest/swc',
  coverageThreshold: {
    global: {
      branches: 92,
      lines: 98,
      functions: 91,
      statements: 98,
    },
  },
};

export default config;
