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
    expect(result).toBe('http://origin/pathname');
  });
});
