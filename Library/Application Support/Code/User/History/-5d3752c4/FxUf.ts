import type { UseQueryParamState, UseQueryParamStateOptions } from './types';
import {
  type ParserBuilder,
  useQueryState,
  type Options,
  type UseQueryStateReturn,
  parseAsString,
} from 'nuqs-next-router';
import { getParser, parseWithCompression } from './utils/getParser';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const LOCAL_STORAGE_DEFAULT_VALUE_WARNING_MSG =
  'WARNING: localStorageKeyPrefix must be used in conjunction with defaultValue.';

export const useQueryParamState: UseQueryParamState = <T>(
  options: UseQueryParamStateOptions<T>,
) => {
  const router = useRouter();
  const params = router.isReady && router.query;
  const { key, defaultValue, push, localStorageKeyPrefix } = options;
  const localStorageKey = localStorageKeyPrefix
    ? `${localStorageKeyPrefix}.${key}`
    : null;

  /**
   * nuqs typings are weird -- and not really working as expected,
   * so unfortunately we aren't able to set a union type to enforce this
   *
   * with this approach, consumers should see the warning and have an understanding
   * of what is needed to change
   */
  if (localStorageKeyPrefix && !defaultValue) {
    console.warn(LOCAL_STORAGE_DEFAULT_VALUE_WARNING_MSG);
  }

  const parser =
    defaultValue !== undefined &&
    getParser(defaultValue, options.forceParseAsJson);

  const nuqsOptions: Options = {
    history: push ? 'push' : 'replace',
    clearOnDefault: true,
  };

  const [state, setState] = useQueryState(
    key,
    // explicitly check for null or undefined so boolean
    // values return true or false
    defaultValue !== '' && defaultValue != undefined && parser
      ? (parser as ParserBuilder<T>)
          .withDefault(defaultValue)
          .withOptions(nuqsOptions)
      : parseWithCompression(parseAsString).withOptions(nuqsOptions),
  ) as UseQueryStateReturn<T, T>;

  useEffect(() => {
    /**
     * On page load, if we're able to pull a persisted value from local storage,
     * update the state if the key isn't already in the url
     */
    if (localStorageKey && params && !params[key]) {
      const persistedValue = window.localStorage.getItem(localStorageKey);
      const notNullOrUndefined =
        defaultValue !== null && defaultValue !== undefined;
      if (notNullOrUndefined && persistedValue && parser) {
        setState(parser.parse(persistedValue) as T);
      }
    }

    if (params && options.hasUnparsedValue) {
      type Parser = ParserBuilder<(typeof params)[number]>;
      const tempParser =
        parseWithCompression(parseAsString).withOptions(nuqsOptions);
      const serialized = (tempParser as Parser).serialize(
        params[key]?.toString() ?? '',
      );
      console.log('[] set state for %s to %s', params[key], serialized);
      // setState(serialized as T);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const nullOrUndefined = defaultValue === '' || defaultValue == null;
    if (localStorageKey && parser) {
      if (nullOrUndefined && state == defaultValue) {
        window.localStorage.removeItem(localStorageKey);
      } else if (state && state !== defaultValue) {
        window.localStorage.setItem(
          localStorageKey,
          (parser as ParserBuilder<T>).serialize(state),
        );
      }
    }
  }, [defaultValue, localStorageKey, parser, state]);

  return [state, setState];
};
