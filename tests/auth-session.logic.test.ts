import { describe, expect, it, vi } from 'vitest'
import { loginWithApiSession, logoutSession } from '../composables/auth-session.logic'
import type { LoginPayload } from '../models/auth'

describe('auth-session.logic', () => {
  it('loginWithApiSession posts then refreshes session', async () => {
    const post = vi.fn().mockResolvedValue({
      ok: true,
      user: { id: '1', email: 'a@b.c', name: 'n', role: 'admin' },
    })
    const fetch = vi.fn().mockResolvedValue(undefined)
    const payload: LoginPayload = { email: 'a@b.c', password: 'secret123' }
    const res = await loginWithApiSession({ fetch }, { post }, payload)
    expect(post).toHaveBeenCalledWith('/api/auth/login', payload)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(res.ok).toBe(true)
  })

  it('logoutSession clears session', async () => {
    const clear = vi.fn().mockResolvedValue(undefined)
    await logoutSession({ clear })
    expect(clear).toHaveBeenCalledTimes(1)
  })
})
