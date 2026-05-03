import { describe, expect, it } from 'vitest'
import { userAvatarSrc } from '../utils/user-avatar'

describe('userAvatarSrc', () => {
  it('uses custom HTTPS URL when set', () => {
    expect(userAvatarSrc('a@b.co', 'https://cdn.example/face.png')).toBe(
      'https://cdn.example/face.png',
    )
  })

  it('falls back to generated avatar when unset', () => {
    expect(userAvatarSrc('ops@local', undefined)).toBe(
      'https://avatar.vercel.sh/ops%40local',
    )
  })

  it('ignores whitespace-only custom URL', () => {
    expect(userAvatarSrc('ops@local', '  \t ')).toBe(
      'https://avatar.vercel.sh/ops%40local',
    )
  })

  it('prefixes relative avatar path with apiBase when set', () => {
    expect(userAvatarSrc('a@b.co', '/api/account/avatar', 'https://api.example')).toBe(
      'https://api.example/api/account/avatar',
    )
  })
})
