import type { NextRouter } from 'next/router';
import { createUrl } from './navigation';

describe('createUrl', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/pathname',
        origin: 'http://origin',
      },
    });
  });

  it('should create a blank URL when its set to reset', () => {
    const result = createUrl({} as NextRouter, true);
    expect(result).toEqual(new URL('http://origin/pathname'));
  });

  it('should create a new URL equal to the given one', () => {
    const result = createUrl(
      { asPath: '/pathname?search' } as NextRouter,
      false,
    );
    expect(result);
  });
});
