import { parseAuthUser } from '../../utils/auth-session-user'
import { accountProfilePatchSchema } from '../../utils/account-profile-schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const raw = await readBody(event)
  const parsed = accountProfilePatchSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid profile payload',
      data: { issues: parsed.error.flatten() },
    })
  }

  await setUserSession(event, {
    user: { name: parsed.data.name },
  })

  const nextSession = await getUserSession(event)
  const user = parseAuthUser(nextSession.user)
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid session user' })
  }

  return { user }
})
