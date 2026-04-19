import type { NextRouter } from 'next/router';

describe('navigation', () => {
  beforeAll(() => {
    window.location = {
      pathname: 'some-feature',
      origin: 'something',
    };
  });
});
