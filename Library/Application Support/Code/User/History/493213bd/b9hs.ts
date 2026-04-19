import type { NextRouter } from 'next/router';
import { createUrl } from './navigation';

describe('createUrl', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      pathname: '/pathname',
      origin: 'origin',
    });
  });

  it('should create a blank URL when its set to reset', () => {
    const result = createUrl({} as NextRouter, true);
    expect(result).toBe('origin/pathname');
  });
});
