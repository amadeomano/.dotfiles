import type { Config } from 'jest';
import preset from '@personio-web/config-jest/swc';

const config: Config = {
  displayName: 'employees-organizations-view-org-chart',
  preset: '@personio-web/config-jest/swc',
  coverageThreshold: {
    global: {
      branches: 61,
      functions: 50,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
