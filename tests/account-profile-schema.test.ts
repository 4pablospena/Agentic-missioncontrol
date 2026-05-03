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

  it('rejects unknown fields (e.g. avatarUrl)', () => {
    expect(
      accountProfilePatchSchema.safeParse({
        name: 'Ada',
        avatarUrl: 'https://example.org/x.png',
      }).success,
    ).toBe(false)
  })
})
