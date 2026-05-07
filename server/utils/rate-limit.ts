interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function nowMs(): number {
  return Date.now()
}

export function assertRateLimit(event: Parameters<typeof getRequestIP>[0], options: {
  key: string
  limit: number
  windowMs: number
}): void {
  const ip = getRequestIP(event) || 'unknown'
  const bucketKey = `${options.key}:${ip}`
  const current = buckets.get(bucketKey)
  const currentTs = nowMs()
  if (!current || current.resetAt <= currentTs) {
    buckets.set(bucketKey, { count: 1, resetAt: currentTs + options.windowMs })
    return
  }
  if (current.count >= options.limit) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: {
        retryAfterMs: current.resetAt - currentTs,
      },
    })
  }
  current.count += 1
  buckets.set(bucketKey, current)
}
