import type { ApiEnvelope } from '~/models/api-contract'

export function unwrapApiEnvelope<TData>(payload: TData | ApiEnvelope<TData>): TData {
  if (
    payload
    && typeof payload === 'object'
    && 'data' in payload
    && 'meta' in payload
  ) {
    return (payload as ApiEnvelope<TData>).data
  }
  return payload as TData
}
