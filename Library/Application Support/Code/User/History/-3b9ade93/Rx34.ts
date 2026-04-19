import type { Config } from 'jest';

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
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
        jsc: {
          experimental: {
            plugins: [['swc_mut_cjs_exports', {}]],
          },
          target: 'es2021',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(d3-zoom)/)'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$':
      '<rootDir>/configs/jest/src/mocks/fileMock.js',
  },
};

export default config;
