// @ts-check
const core = require('../src/preset').preset;

/**
 * @type {import('jest').Config['transform']}
 */
const transform = {
  '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  '^.+\\.[tj]sx?$': [
    '@swc/jest',
    {
      sourceMaps: 'inline',
      jsc: {
        experimental: {
          plugins: [
            // swc_mut_cjs_exports is used to make CJS exports mutable. This
            // is needed to make `jest.spyOn` work, since it depends on them
            // being mutable. Jest's behaviour is _not_ correct, so the @swc
            // team don't support it, hence the plugin.
            ['swc_mut_cjs_exports', {}],
          ],
        },
        target: 'es2021',
        transform: {
          // Without this, all tests will need to import React into the test
          // file. This enables us to write JSX directly in the test files but
          // not need to explicitly import React.
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
};

/**
 * @type {import('jest').Config}
 */
const preset = {
  ...core,
  transform,
  globals: undefined,
};

module.exports = { preset };
