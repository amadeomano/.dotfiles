import type { NextRouter } from 'next/router';
import { createUrl } from './navigation';

describe('createUrl', () => {
  global.window.location.pathname = '/pathname';
  global.window.location.origin = 'origin';
  beforeAll(() => {
    // global.window.location = {
    //   pathname: '/pathname',
    //   origin: 'origin',
    // } as Location;
  });

  it('should create a blank URL when its set to reset', () => {
    const result = createUrl({} as NextRouter, true);
    expect(result).toBe('origin/pathname');
  });
});
