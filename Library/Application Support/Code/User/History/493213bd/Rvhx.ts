import type { NextRouter } from 'next/router';
import { createUrl } from './navigation';

describe('createUrl', () => {
  beforeAll(() => {
    window.location = {
      pathname: '/pathname',
      origin: 'origin',
    } as Location;
  });

  it('should create a blank URL when its set to reset', () => {
    const result = createUrl({} as NextRouter, true);
  });
});
