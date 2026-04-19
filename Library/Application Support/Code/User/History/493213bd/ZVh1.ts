import type { NextRouter } from 'next/router';
import { createUrl } from './navigation';

describe('createUrl', () => {
  beforeAll(() => {
    const url = new URL('https://origin/basePath');
  });

  it('should create a blank URL when its set to reset', () => {
    const result = createUrl({} as NextRouter, true);
    expect(result).toBe('origin/pathname');
  });
});
