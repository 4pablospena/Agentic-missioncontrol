export type MemorySource = 'chat' | 'task' | 'manual' | 'system'

export interface MemoryItem {
  id: string
  agentId: string
  sessionId?: string
  content: string
  source: MemorySource
  embeddingModel?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface SemanticSearchPayload {
  query: string
  agentId?: string
  sessionId?: string
  source?: MemorySource
  from?: string
  to?: string
  limit: number
}

export interface SemanticSearchResult {
  memory: MemoryItem
  similarity: number
  matchedContext?: string
}

export interface InjectMemoryPayload {
  agentId: string
  sessionId?: string
  content: string
  metadata?: Record<string, unknown>
}

export interface MemoryListFilters {
  agentId?: string
  sessionId?: string
  source?: MemorySource
  from?: string
  to?: string
}
