export type ApiDomain
  = 'openclaw'
    | 'metrics'
    | 'workspace'
    | 'scheduler'
    | 'notifications'

export interface ApiMeta {
  domain: ApiDomain
  generatedAt: string
  degraded?: boolean
}

export interface ApiEnvelope<TData> {
  data: TData
  meta: ApiMeta
}
