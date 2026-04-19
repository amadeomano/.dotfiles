import type { NextRouter } from 'next/router';
import { commitNavigation, createParamHandlers, createUrl } from './navigation';

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
    const result = createUrl(
      { asPath: '/somepath?somesearch' } as NextRouter,
      true,
    );
    expect(result).toEqual(new URL('http://origin/pathname'));
  });

  it('should create a new URL equal to the given one', () => {
    const result = createUrl(
      { asPath: '/pathname?search' } as NextRouter,
      false,
    );
    expect(result).toEqual(new URL('http://origin/pathname?search'));
  });
});

describe('commitNavigation', () => {
  const router = {
    asPath: '/pathname?search',
    replace: jest.fn(),
  } as unknown as NextRouter;
  it('should not call the navigation if the given url and the current address are the same', () => {
    commitNavigation(router, new URL('http://origin/pathname?search'));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('should call the navigation with the new url when its different', () => {
    const newUrl = new URL('http://origin/pathname?search=something');
    commitNavigation(router, newUrl);
    expect(router.replace).toBeCalledWith(newUrl);
  });
});

describe('createParamHandlers', () => {
  it('should return typed functions to get, set and delete params', () => {
    const result = createParamHandlers(['key1', 'key2']);
    expect(result).toEqual({
      getParams: expect.any(Function),
      setParam: expect.any(Function),
      deleteParam: expect.any(Function),
    });
  });
});
