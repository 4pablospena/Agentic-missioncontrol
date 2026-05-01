import { z } from 'zod'
import type { AuthUser } from '~/models/user'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const config = useRuntimeConfig(event)
  const mc = config.mcAuth as {
    email?: string
    password?: string
    passwordHash?: string
  }

  const expectedEmail = String(
    mc.email || process.env.MISSION_CONTROL_OPERATOR_EMAIL || '',
  ).trim()
  const plainPassword = String(
    mc.password || process.env.MISSION_CONTROL_OPERATOR_PASSWORD || '',
  )
  const passwordHash = String(
    mc.passwordHash || process.env.MISSION_CONTROL_OPERATOR_PASSWORD_HASH || '',
  )

  if (!expectedEmail || (!plainPassword.trim() && !passwordHash.trim())) {
    throw createError({ statusCode: 503, statusMessage: 'Authentication is not configured' })
  }

  const emailOk = parsed.data.email === expectedEmail

  let passwordOk = false
  if (passwordHash.trim()) {
    passwordOk = await verifyPassword(passwordHash.trim(), parsed.data.password)
  }
  else if (plainPassword) {
    passwordOk = parsed.data.password === plainPassword
  }

  if (!emailOk || !passwordOk) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const user: AuthUser = {
    id: 'operator',
    email: expectedEmail,
    name: 'Mission Control Operator',
    role: 'admin',
  }

  await setUserSession(event, {
    user,
    loggedInAt: new Date(),
  })

  return { ok: true as const, user }
})
