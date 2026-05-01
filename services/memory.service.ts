import type {
  InjectMemoryPayload,
  MemoryItem,
  MemoryListFilters,
  SemanticSearchPayload,
  SemanticSearchResult,
} from '~/models/memory'
import type { ApiClient } from '~/services/api-client.service'

export interface MemoryService {
  list(filters?: MemoryListFilters & { limit?: number }): Promise<MemoryItem[]>
  search(payload: SemanticSearchPayload): Promise<SemanticSearchResult[]>
  inject(payload: InjectMemoryPayload): Promise<MemoryItem>
  get(memoryId: string): Promise<MemoryItem>
  remove(memoryId: string): Promise<void>
}

function appendMemoryQuery(params: URLSearchParams, filters: MemoryListFilters & { limit?: number }) {
  if (filters.agentId?.trim())
    params.set('agentId', filters.agentId.trim())
  if (filters.sessionId?.trim())
    params.set('sessionId', filters.sessionId.trim())
  if (filters.source)
    params.set('source', filters.source)
  if (filters.from?.trim())
    params.set('from', filters.from.trim())
  if (filters.to?.trim())
    params.set('to', filters.to.trim())
  if (filters.limit != null)
    params.set('limit', String(filters.limit))
}

export function createMemoryService(client: ApiClient): MemoryService {
  return {
    async list(filters = {}) {
      const params = new URLSearchParams()
      appendMemoryQuery(params, filters)
      const qs = params.toString()
      return client.get<MemoryItem[]>(`/api/memory${qs ? `?${qs}` : ''}`)
    },
    search(payload: SemanticSearchPayload) {
      return client.post<SemanticSearchPayload, SemanticSearchResult[]>('/api/memory/search', payload)
    },
    inject(payload: InjectMemoryPayload) {
      return client.post<InjectMemoryPayload, MemoryItem>('/api/memory/inject', payload)
    },
    get(memoryId: string) {
      return client.get<MemoryItem>(`/api/memory/${encodeURIComponent(memoryId)}`)
    },
    async remove(memoryId: string) {
      await client.delete(`/api/memory/${encodeURIComponent(memoryId)}`)
    },
  }
}
