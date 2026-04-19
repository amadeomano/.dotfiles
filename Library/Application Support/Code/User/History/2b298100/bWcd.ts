import { type UseQueryStateReturn } from 'nuqs-next-router';

export interface UseQueryParamStateOptions<T> {
  key: string;
  defaultValue?: T;
  push?: boolean;
  localStorageKeyPrefix?: string;
  forceParseAsJson?: boolean;
  hasUnparsedValue? boolean;
}

export type UseQueryParamState = <T>(
  options: UseQueryParamStateOptions<T>,
) => UseQueryStateReturn<T, T>;
