import type { Config } from 'jest';

const config: Config = {
  displayName: 'payroll-component-payroll-layout',
  preset: '@personio-web/config-jest/swc',
  coveragePathIgnorePatterns: ['/stories/'],
  coverageThreshold: {
    global: {
      branches: 90,
      lines: 90,
      functions: 90,
      statements: 90,
    },
  },
};

export default config;
