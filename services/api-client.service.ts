import type { $Fetch, FetchOptions } from 'ofetch'

export interface ApiClient {
  get<TResponse>(path: string, opts?: FetchOptions<'json'>): Promise<TResponse>
  post<TPayload, TResponse>(
    path: string,
    payload: TPayload,
    opts?: FetchOptions<'json'>,
  ): Promise<TResponse>
}

export function createApiClient(fetchImpl: $Fetch, basePath = ''): ApiClient {
  const url = (path: string) => `${basePath}${path}`

  return {
    get<TResponse>(path: string, opts?: FetchOptions<'json'>) {
      return fetchImpl<TResponse>(url(path), { ...opts, method: 'GET' })
    },
    post<TPayload, TResponse>(
      path: string,
      payload: TPayload,
      opts?: FetchOptions<'json'>,
    ) {
      return fetchImpl<TResponse>(url(path), {
        ...opts,
        method: 'POST',
        body: payload,
      })
    },
  }
}
