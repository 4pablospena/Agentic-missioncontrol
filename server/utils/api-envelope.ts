import type { ApiDomain, ApiEnvelope } from '~/models/api-contract'

export function withApiEnvelope<TData>(
  domain: ApiDomain,
  data: TData,
  options: { degraded?: boolean } = {},
): ApiEnvelope<TData> {
  return {
    data,
    meta: {
      domain,
      generatedAt: new Date().toISOString(),
      ...(options.degraded ? { degraded: true } : {}),
    },
  }
}
