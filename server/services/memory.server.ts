import { randomUUID } from 'node:crypto'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import type {
  InjectMemoryPayload,
  MemoryItem,
  MemoryListFilters,
  MemorySource,
  SemanticSearchPayload,
  SemanticSearchResult,
} from '~/models/memory'
import type { MissionControlEvent } from '~/models/realtime'
import { getDb } from '../db/client'
import { memoryItems } from '../db/schema'
import { broadcastMissionControlEvent } from '../utils/realtime-broadcast'
import { createEmbeddingProvider } from './embedding-provider.server'
import { indexMemoryItem } from './memory-indexer.server'
import { createLogEntry } from './logger.server'
import { searchMemoryVectors } from './vector-store.server'

function nowIso(): string {
  return new Date().toISOString()
}

function parseMeta(raw: string | null): Record<string, unknown> | undefined {
  if (!raw)
    return undefined
  try {
    const v = JSON.parse(raw) as unknown
    return typeof v === 'object' && v !== null && !Array.isArray(v)
      ? v as Record<string, unknown>
      : undefined
  }
  catch {
    return undefined
  }
}

export function mapMemoryRow(row: typeof memoryItems.$inferSelect): MemoryItem {
  return {
    id: row.id,
    agentId: row.agentId,
    sessionId: row.sessionId ?? undefined,
    content: row.content,
    source: row.source as MemorySource,
    embeddingModel: row.embeddingModel ?? undefined,
    metadata: parseMeta(row.metadataJson),
    createdAt: row.createdAt,
  }
}

function broadcastEvt(partial: Omit<MissionControlEvent, 'id' | 'createdAt'> & { id?: string }) {
  const full: MissionControlEvent = {
    id: partial.id ?? randomUUID(),
    type: partial.type,
    payload: partial.payload,
    createdAt: partial.createdAt ?? nowIso(),
  }
  broadcastMissionControlEvent(full)
}

export function listMemoryItems(
  filters: MemoryListFilters & { limit?: number },
): MemoryItem[] {
  const db = getDb()
  const conditions = []
  if (filters.agentId?.trim())
    conditions.push(eq(memoryItems.agentId, filters.agentId.trim()))
  if (filters.sessionId?.trim())
    conditions.push(eq(memoryItems.sessionId, filters.sessionId.trim()))
  if (filters.source)
    conditions.push(eq(memoryItems.source, filters.source))
  if (filters.from?.trim())
    conditions.push(gte(memoryItems.createdAt, filters.from.trim()))
  if (filters.to?.trim())
    conditions.push(lte(memoryItems.createdAt, filters.to.trim()))

  const limit = Math.min(filters.limit ?? 100, 500)
  const base = db.select().from(memoryItems)
  const qb = conditions.length > 0 ? base.where(and(...conditions)) : base
  const rows = qb.orderBy(desc(memoryItems.createdAt)).limit(limit).all()
  return rows.map(mapMemoryRow)
}

export function getMemoryItem(id: string): MemoryItem | null {
  const db = getDb()
  const row = db.select().from(memoryItems).where(eq(memoryItems.id, id)).get()
  return row ? mapMemoryRow(row) : null
}

export async function deleteMemoryItem(id: string): Promise<boolean> {
  const db = getDb()
  const existing = db.select().from(memoryItems).where(eq(memoryItems.id, id)).get()
  if (!existing)
    return false

  db.delete(memoryItems).where(eq(memoryItems.id, id)).run()

  await createLogEntry({
    agentId: existing.agentId,
    level: 'info',
    message: 'memory.deleted',
    metadata: { memoryId: id },
  })

  broadcastEvt({
    type: 'memory.deleted',
    payload: { memoryId: id, agentId: existing.agentId },
  })

  return true
}

async function insertIndexedMemoryItem(params: {
  agentId: string
  sessionId?: string
  content: string
  source: MemorySource
  metadata?: Record<string, unknown>
  emitCreated?: boolean
}): Promise<MemoryItem> {
  const db = getDb()
  const id = randomUUID()
  const createdAt = nowIso()

  db.insert(memoryItems).values({
    id,
    agentId: params.agentId.trim(),
    sessionId: params.sessionId?.trim() || null,
    source: params.source,
    content: params.content,
    metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
    embeddingJson: null,
    embeddingModel: null,
    createdAt,
  }).run()

  await indexMemoryItem(id)

  const row = db.select().from(memoryItems).where(eq(memoryItems.id, id)).get()
  if (!row)
    throw createError({ statusCode: 500, statusMessage: 'Failed to persist memory item' })

  if (params.emitCreated !== false) {
    broadcastEvt({
      type: 'memory.created',
      payload: { memoryId: id, agentId: params.agentId.trim(), source: params.source },
    })
  }

  return mapMemoryRow(row)
}

export async function injectMemory(payload: InjectMemoryPayload): Promise<MemoryItem> {
  const item = await insertIndexedMemoryItem({
    agentId: payload.agentId.trim(),
    sessionId: payload.sessionId,
    content: payload.content,
    source: 'manual',
    metadata: payload.metadata,
    emitCreated: true,
  })

  await createLogEntry({
    agentId: payload.agentId.trim(),
    level: 'info',
    message: 'memory.injected',
    metadata: { memoryId: item.id },
  })

  return item
}

export async function appendMemoryFromChat(params: {
  agentId: string
  sessionId?: string
  content: string
  metadata?: Record<string, unknown>
}): Promise<MemoryItem> {
  return insertIndexedMemoryItem({
    agentId: params.agentId.trim(),
    sessionId: params.sessionId,
    content: params.content,
    source: 'chat',
    metadata: params.metadata,
    emitCreated: true,
  })
}

export async function importMemoryItemsFromSnapshot(
  items: Array<Omit<MemoryItem, 'embeddingModel'> & { embeddingModel?: string }>,
): Promise<number> {
  let n = 0
  for (const it of items) {
    await insertIndexedMemoryItem({
      agentId: it.agentId.trim(),
      sessionId: it.sessionId,
      content: it.content,
      source: it.source,
      metadata: it.metadata,
      emitCreated: false,
    })
    n++
  }
  return n
}

export async function semanticSearchMemory(
  payload: SemanticSearchPayload,
): Promise<SemanticSearchResult[]> {
  const embedder = createEmbeddingProvider()
  const queryVec = await embedder.embed(payload.query)
  const c = useRuntimeConfig()
  const maxScan = Number(c.memorySearchMaxScan) || 5000

  const scored = await searchMemoryVectors({
    queryEmbedding: queryVec,
    filters: {
      agentId: payload.agentId,
      sessionId: payload.sessionId,
      source: payload.source,
      from: payload.from,
      to: payload.to,
    },
    limit: payload.limit,
    maxScan,
  })

  await createLogEntry({
    level: 'info',
    message: 'memory.semantic_search',
    metadata: {
      queryLength: payload.query.length,
      resultCount: scored.length,
      agentId: payload.agentId,
    },
  })

  return scored.map(({ row, similarity }) => ({
    memory: mapMemoryRow(row),
    similarity,
    matchedContext: row.content.length > 280 ? `${row.content.slice(0, 277)}…` : row.content,
  }))
}
