import type { Config } from 'jest';

const config: Config = {
  displayName: 'payroll-view-preliminary-payroll',
  preset: '@personio-web/config-jest/swc',
  setupFilesAfterEnv: ['./jest.mocks.ts'],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 40,
      functions: 50,
      lines: 60,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/{types,index}.ts',
    '!**/*.d.ts',
    '!**/*.stories.tsx',
  ],
};

export default config;
