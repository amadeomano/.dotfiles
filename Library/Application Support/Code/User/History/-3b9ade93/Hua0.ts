import type { Config } from 'jest';

const config: Config = {
  displayName: 'employees-organizations-view-org-chart',
  preset: '@personio-web/config-jest/swc',
  transformIgnorePatterns: ['/node_modules/(?!(d3-zoom)/)'],
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
