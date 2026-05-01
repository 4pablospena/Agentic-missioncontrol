import { createLogEntry } from './logger.server'

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>
  dimensions(): number
}

function normalize(vec: number[]): number[] {
  let sum = 0
  for (const v of vec)
    sum += v * v
  const norm = Math.sqrt(sum) || 1
  return vec.map(v => v / norm)
}

/** Deterministic pseudo-embedding for dev/tests when no HTTP provider is configured. */
export function mockEmbedding(text: string, dimension: number): number[] {
  const vec = new Array<number>(dimension).fill(0)
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
    vec[i % dimension] += ((h >>> 0) & 0xffff) / 65535
  }
  return normalize(vec)
}

interface OpenAiEmbeddingResponse {
  data?: Array<{ embedding?: number[] }>
}

function resolveEmbeddingEndpoint(rawUrl: string): string {
  const u = rawUrl.trim().replace(/\/$/, '')
  if (u.endsWith('/embeddings'))
    return u
  return `${u}/v1/embeddings`
}

function readDimensions(): number {
  const c = useRuntimeConfig()
  const n = Number(c.memoryEmbeddingDimensions)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 256
}

export function createEmbeddingProvider(): EmbeddingProvider {
  return {
    dimensions(): number {
      return readDimensions()
    },

    async embed(text: string): Promise<number[]> {
      const c = useRuntimeConfig()
      const apiUrl = String(c.memoryEmbeddingApiUrl ?? '').trim()
      const dim = readDimensions()

      if (!apiUrl) {
        return mockEmbedding(text, dim)
      }

      const endpoint = resolveEmbeddingEndpoint(apiUrl)
      const apiKey = String(c.memoryEmbeddingApiKey ?? '').trim()
      const model = String(c.memoryEmbeddingModel ?? 'text-embedding-3-small')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model, input: text }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        await createLogEntry({
          level: 'warn',
          message: 'embedding.http.failed',
          metadata: { status: res.status, body: body.slice(0, 500) },
        })
        return mockEmbedding(text, dim)
      }

      const json = await res.json() as OpenAiEmbeddingResponse
      const emb = json.data?.[0]?.embedding
      if (!Array.isArray(emb) || emb.length === 0 || emb.some(n => typeof n !== 'number')) {
        await createLogEntry({
          level: 'warn',
          message: 'embedding.http.invalid_response',
          metadata: {},
        })
        return mockEmbedding(text, dim)
      }

      if (emb.length !== dim) {
        await createLogEntry({
          level: 'info',
          message: 'embedding.dimension_mismatch',
          metadata: { expected: dim, got: emb.length },
        })
      }

      return normalize(emb)
    },
  }
}
