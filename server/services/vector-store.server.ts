import { and, desc, eq, gte, lte } from 'drizzle-orm'
import type { VectorSearchRequest } from '~/models/vector'
import { getDb } from '../db/client'
import { memoryItems } from '../db/schema'

export interface ScoredMemoryRow {
  row: typeof memoryItems.$inferSelect
  similarity: number
}

export function parseStoredEmbedding(raw: string | null): number[] | null {
  if (!raw)
    return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0)
      return null
    const nums = parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
    return nums.length === parsed.length ? nums : null
  }
  catch {
    return null
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0)
    return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  return denom === 0 ? 0 : dot / denom
}

/**
 * Loads up to `maxScan` rows (after filters, newest first), scores by cosine vs query embedding in Node.
 * Practical cap: tune `memorySearchMaxScan` in runtime config.
 */
export async function searchMemoryVectors(req: VectorSearchRequest): Promise<ScoredMemoryRow[]> {
  const db = getDb()
  const queryVec = req.queryEmbedding
  if (!queryVec.length)
    return []

  const filters = req.filters
  const conditions = []
  if (filters?.agentId?.trim())
    conditions.push(eq(memoryItems.agentId, filters.agentId.trim()))
  if (filters?.sessionId?.trim())
    conditions.push(eq(memoryItems.sessionId, filters.sessionId.trim()))
  if (filters?.source)
    conditions.push(eq(memoryItems.source, filters.source))
  if (filters?.from?.trim())
    conditions.push(gte(memoryItems.createdAt, filters.from.trim()))
  if (filters?.to?.trim())
    conditions.push(lte(memoryItems.createdAt, filters.to.trim()))

  const base = db.select().from(memoryItems)
  const qb = conditions.length > 0 ? base.where(and(...conditions)) : base
  const maxScan = Math.max(1, req.maxScan ?? 5000)
  const rows = qb.orderBy(desc(memoryItems.createdAt)).limit(maxScan).all()

  const scored: ScoredMemoryRow[] = []
  for (const row of rows) {
    const emb = parseStoredEmbedding(row.embeddingJson)
    if (!emb || emb.length !== queryVec.length)
      continue
    scored.push({ row, similarity: cosineSimilarity(queryVec, emb) })
  }

  scored.sort((a, b) => b.similarity - a.similarity)
  const limit = Math.max(1, req.limit)
  return scored.slice(0, limit)
}
