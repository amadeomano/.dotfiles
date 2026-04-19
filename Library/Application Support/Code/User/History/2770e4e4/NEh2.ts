import { useAuthContext } from '@personio-web/auth-context';
import request, { type AxiosRequestConfig } from '@personio-web/request';
import {
  type UseMutationResult,
  useMutation,
  useQuery,
  type UseQueryResult,
} from 'react-query';
import { useGbNavigation } from '../usePayrollGbBreadcrumbsNavigation';

type AxiosParams = Omit<
  AxiosRequestConfig,
  'method' | 'url' | 'headers' | 'params' | 'data'
>;

const replacePathParams = (
  url: string,
  params: Record<string, string | number> | undefined,
) => {
  const urlWithoutAthenaPrefix = url.replace('/public/athena', '');
  return params
    ? urlWithoutAthenaPrefix.replace(/(:(.*?))(?![^/])/gs, (_1, _2, key) =>
        String(params[key]),
      )
    : urlWithoutAthenaPrefix;
};

/**
 * This is a temporary way to do local requests instead of mocks
 * to unblock full-stack DX. We want to get to a place where this
 * does not require caller-side code changes, but TBD.
 */

const LOCAL_SERVICE_BASE_URL = 'http://localhost:8080';

type GeneralWrapOptions = {
  requestPathParams?: Record<string, string | number>;
  requestHeaders?: Record<string, string | number>;
  requestQuery?: Record<string, string | number>;
  requestBody?: Record<string, unknown>;
  enabled?: boolean;
};

type GenericWrapHeaders = {
  Authorization?: string;
  'X-Company-Id': number;
  'X-Legal-Entity-Id': string;
};

export function useGetDefaultHeaders(): GenericWrapHeaders {
  const { legalEntityId } = useGbNavigation();
  const companyId = useAuthContext().companyId;

  if (process.env.NODE_ENV === 'development' && process.env.MOCK_ACCESS_TOKEN) {
    return {
      Authorization: `Bearer ${process.env.MOCK_ACCESS_TOKEN}`,
      'X-Company-Id': companyId,
      'X-Legal-Entity-Id': `${legalEntityId ?? ''}`,
    };
  } else {
    return {
      // Authorization is automatically handled via the cookie
      'X-Company-Id': companyId,
      'X-Legal-Entity-Id': `${legalEntityId ?? ''}`,
    };
  }
}

export function useWrapQuery<TData = unknown, TParams = unknown>(
  hook: (options: TParams) => UseQueryResult<TData>,
  apiDefinition: { KEY: unknown; METHOD: string; API_PATH: string },
): (options: TParams & GeneralWrapOptions) => UseQueryResult<TData> {
  return (options: TParams & GeneralWrapOptions) => {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.MOCK_ACCESS_TOKEN
    ) {
      // Breaking rules-of-hooks 'probably' OK here as the conditional is deterministic build-time
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const companyId = useAuthContext().companyId;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery({
        queryKey: [apiDefinition.KEY, options, companyId],
        queryFn: () =>
          request(
            replacePathParams(
              apiDefinition.API_PATH,
              options?.requestPathParams ?? {},
            ),
            {
              baseURL: LOCAL_SERVICE_BASE_URL,
              method: apiDefinition.METHOD,
              params: options?.requestQuery ?? {},
              headers: options?.requestHeaders ?? {
                Authorization: `Bearer ${process.env.MOCK_ACCESS_TOKEN}`,
                'X-Company-Id': companyId,
              },
            },
          ).then((res) => res.data),
        enabled: 'enabled' in options ? options.enabled : true,
      });
    } else {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return hook(options);
    }
  };
}

export function useWrapMutation<TData, TError, TVariables, TContext>(
  hook: () => UseMutationResult<TData, TError, TVariables, TContext>,
  apiDefinition: { KEY: unknown; METHOD: string; API_PATH: string },
  axiosParams?: AxiosParams,
): UseMutationResult<TData, TError, TVariables, TContext> {
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_ACCESS_TOKEN) {
    // Breaking rules-of-hooks 'probably' OK here as the conditional is deterministic build-time
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const companyId = useAuthContext().companyId;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMutation({
      mutationKey: [apiDefinition.KEY],
      mutationFn: (variables: TVariables & GeneralWrapOptions) =>
        request(
          replacePathParams(
            apiDefinition.API_PATH,
            variables?.requestPathParams ?? {},
          ),
          {
            baseURL: LOCAL_SERVICE_BASE_URL,
            method: apiDefinition.METHOD,
            data: variables?.requestBody ?? {},
            params: variables?.requestQuery ?? {},
            headers: variables.requestHeaders ?? {
              Authorization: `Bearer ${process.env.MOCK_ACCESS_TOKEN}`,
              'X-Company-Id': companyId,
            },
            ...axiosParams,
          },
        ).then((res) =>
          ['blob', 'text'].includes(axiosParams?.responseType ?? 'unknown')
            ? res
            : res.data.data ?? res.data,
        ),
    }) as UseMutationResult<TData, TError, TVariables, TContext>;
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return hook();
  }
}
