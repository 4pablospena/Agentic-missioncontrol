import { randomUUID } from 'node:crypto'
import { createLogEntry } from '../services/logger.server'
import { parseCreateLogBody } from '../utils/create-log-payload'
import { broadcastMissionControlEvent } from '../utils/realtime-broadcast'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const raw = await readBody(event)
  const parsed = parseCreateLogBody(raw)
  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid log payload',
      data: { issues: parsed.issues },
    })
  }

  const entry = await createLogEntry({
    level: parsed.data.level,
    message: parsed.data.message,
    agentId: parsed.data.agentId,
    metadata: parsed.data.metadata,
  })

  broadcastMissionControlEvent({
    id: randomUUID(),
    type: 'log.created',
    payload: {
      logId: entry.id,
      level: entry.level,
      agentId: entry.agentId,
      message: entry.message,
    },
    createdAt: entry.createdAt,
  })

  return entry
})
