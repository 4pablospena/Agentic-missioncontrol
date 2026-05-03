import { describe, expect, it } from 'vitest'
import { accountProfilePatchSchema } from '../server/utils/account-profile-schema'

describe('accountProfilePatchSchema', () => {
  it('accepts trimmed name in range', () => {
    const r = accountProfilePatchSchema.safeParse({ name: '  Ada Lovelace  ' })
    expect(r.success).toBe(true)
    if (r.success)
      expect(r.data.name).toBe('Ada Lovelace')
  })

  it('rejects empty', () => {
    expect(accountProfilePatchSchema.safeParse({ name: '' }).success).toBe(false)
    expect(accountProfilePatchSchema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('rejects too long', () => {
    expect(
      accountProfilePatchSchema.safeParse({ name: 'x'.repeat(121) }).success,
    ).toBe(false)
  })

  it('accepts optional HTTPS avatar URL', () => {
    const r = accountProfilePatchSchema.safeParse({
      name: 'Ada',
      avatarUrl: '  https://example.org/p.png  ',
    })
    expect(r.success).toBe(true)
    if (r.success)
      expect(r.data.avatarUrl).toBe('https://example.org/p.png')
  })

  it('accepts uploaded-avatar session path', () => {
    const r = accountProfilePatchSchema.safeParse({
      name: 'Ada',
      avatarUrl: '/api/account/avatar',
    })
    expect(r.success).toBe(true)
  })

  it('accepts omitted avatar URL', () => {
    const r = accountProfilePatchSchema.safeParse({ name: 'Ada' })
    expect(r.success).toBe(true)
    if (r.success)
      expect(r.data.avatarUrl).toBeUndefined()
  })

  it('accepts empty avatar URL to clear', () => {
    const r = accountProfilePatchSchema.safeParse({ name: 'Ada', avatarUrl: '' })
    expect(r.success).toBe(true)
    if (r.success)
      expect(r.data.avatarUrl).toBe('')
  })

  it('rejects non-HTTPS avatar URL', () => {
    expect(
      accountProfilePatchSchema.safeParse({
        name: 'Ada',
        avatarUrl: 'http://example.org/x.png',
      }).success,
    ).toBe(false)
  })

  it('rejects invalid avatar URL', () => {
    expect(
      accountProfilePatchSchema.safeParse({
        name: 'Ada',
        avatarUrl: 'not-a-url',
      }).success,
    ).toBe(false)
  })
})
