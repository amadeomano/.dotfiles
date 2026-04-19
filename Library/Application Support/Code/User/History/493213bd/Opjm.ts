import type { NextRouter } from 'next/router';

describe('navigation', () => {
  beforeAll(() => {
    window.location = {
      pathname: 'pathname',
      origin: 'origin/',
    } as Location;
  });
});
