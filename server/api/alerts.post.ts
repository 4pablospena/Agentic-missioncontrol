import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { MissionControlEvent } from '~/models/realtime'
import { createAlertEntry } from '../services/alerts.server'
import { broadcastMissionControlEvent } from '../utils/realtime-broadcast'

const bodySchema = z.object({
  agentId: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string().min(1),
  message: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const raw = await readBody(event)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid alert payload',
      data: { issues: parsed.error.flatten() },
    })
  }

  const alert = await createAlertEntry(parsed.data)

  const realtimeEvt: MissionControlEvent = {
    id: randomUUID(),
    type: 'alert.created',
    payload: {
      alertId: alert.id,
      severity: alert.severity,
      title: alert.title,
    },
    createdAt: new Date().toISOString(),
  }
  broadcastMissionControlEvent(realtimeEvt)

  return alert
})
