import { scheduleCreateBodySchema } from '../../utils/schedules-body-schema'
import { createSchedule } from '../../services/scheduler.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const raw = await readBody(event)
  const parsed = scheduleCreateBodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid schedule payload',
      data: { issues: parsed.error.flatten() },
    })
  }
  try {
    return await createSchedule(parsed.data)
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create schedule'
    throw createError({ statusCode: 400, statusMessage: msg })
  }
})
