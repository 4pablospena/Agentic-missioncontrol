import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { memoryItems } from '../db/schema'
import { createEmbeddingProvider } from './embedding-provider.server'

export async function indexMemoryItem(memoryItemId: string): Promise<void> {
  const db = getDb()
  const row = db.select().from(memoryItems).where(eq(memoryItems.id, memoryItemId)).get()
  if (!row)
    return

  const embedder = createEmbeddingProvider()
  const vector = await embedder.embed(row.content)
  const c = useRuntimeConfig()
  const model = String(c.memoryEmbeddingApiUrl ?? '').trim()
    ? String(c.memoryEmbeddingModel ?? '')
    : 'mock/deterministic'

  db.update(memoryItems)
    .set({
      embeddingJson: JSON.stringify(vector),
      embeddingModel: model || null,
    })
    .where(eq(memoryItems.id, memoryItemId))
    .run()
}
