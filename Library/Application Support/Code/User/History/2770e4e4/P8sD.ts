import { useAuthContext } from '@personio-web/auth-context';
import request, { AxiosRequestConfig, AxiosError } from '@personio/request';
import {
  UseMutationResult,
  useMutation,
  useQuery,
  type UseQueryResult,
} from 'react-query';

type AxiosParams = Omit<
  AxiosRequestConfig,
  'method' | 'url' | 'headers' | 'params' | 'data'
>;

const replacePathParams = (
  url: string,
  params: Record<string, string | number> | undefined,
) =>
  params
    ? url.replace(/(:(.*?))(?![^/])/gs, (_1, _2, key) => String(params[key]))
    : url;

/**
 * This is a temporary way to do local requests instead of mocks
 * to unblock full-stack DX. We want to get to a place where this
 * does not require caller-side code changes, but TBD.
 */

const LOCAL_SERVICE_BASE_URL = 'http://localhost:8080';

type GeneralWrapOptions = {
  requestPathParams?: Record<string, string | number>;
  requestQuery?: Record<string, string | number>;
  requestBody?: Record<string, unknown>;
  enabled?: boolean;
};

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
              headers: {
                Authorization: `Bearer ${process.env.MOCK_ACCESS_TOKEN}`,
                'X-Company-Id': companyId ?? '',
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
      mutationFn: async (variables: TVariables & GeneralWrapOptions) =>
        request(
          replacePathParams(
            apiDefinition.API_PATH,
            variables?.requestPathParams ?? {},
          ),
          {
            baseURL: LOCAL_SERVICE_BASE_URL,
            method: apiDefinition.METHOD,
            data: variables?.requestBody ?? {},
            headers: {
              Authorization: `Bearer ${process.env.MOCK_ACCESS_TOKEN}`,
              'X-Company-Id': companyId ?? '',
            },
            ...axiosParams,
          },
        )
          .then((res) =>
            ['blob', 'text'].includes(axiosParams?.responseType ?? 'unknown')
              ? res
              : res.data.data,
          )
          .catch((error: AxiosError) => Promise.reject(error)),
    }) as UseMutationResult<TData, TError, TVariables, TContext>;
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return hook();
  }
}
