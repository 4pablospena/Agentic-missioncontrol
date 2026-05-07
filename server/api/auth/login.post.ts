import { z } from 'zod'
import type { AuthUser } from '~/models/user'
import { assertRateLimit } from '../../utils/rate-limit'
import { logStructured } from '../../utils/structured-log'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  assertRateLimit(event, { key: 'auth.login', limit: 10, windowMs: 60_000 })
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

  /** Prefer Nitro runtimeConfig; fall back to process.env (production Nitro may not merge nested mcAuth from env reliably). */
  const expectedEmail = String(
    mc.email?.trim()
      || process.env.NUXT_MC_AUTH_EMAIL?.trim()
      || process.env.MISSION_CONTROL_OPERATOR_EMAIL?.trim()
      || '',
  ).trim()
  const plainPassword = String(
    mc.password?.trim()
      || process.env.NUXT_MC_AUTH_PASSWORD
      || process.env.MISSION_CONTROL_OPERATOR_PASSWORD
      || '',
  )
  const passwordHash = String(
    mc.passwordHash?.trim()
      || process.env.NUXT_MC_AUTH_PASSWORD_HASH?.trim()
      || process.env.MISSION_CONTROL_OPERATOR_PASSWORD_HASH?.trim()
      || '',
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
    logStructured('warn', 'auth.login.failed', {
      route: '/api/auth/login',
      email: parsed.data.email,
    })
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
    loggedInAt: new Date().toISOString(),
  })

  return { ok: true as const, user }
})
