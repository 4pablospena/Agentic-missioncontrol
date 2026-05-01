import type { MemorySource } from './memory'

/** Internal vector search request (server-side index ops). */
export interface VectorSearchRequest {
  queryEmbedding: number[]
  filters?: {
    agentId?: string
    sessionId?: string
    source?: MemorySource
    from?: string
    to?: string
  }
  limit: number
  /** Cap rows loaded from DB before similarity scoring */
  maxScan?: number
}
