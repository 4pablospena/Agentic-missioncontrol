import { describe, expect, it } from 'vitest'
import { sniffImageContentType } from '../server/utils/avatar-upload'

describe('sniffImageContentType', () => {
  it('detects PNG', () => {
    const png = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
      0,
    ])
    expect(sniffImageContentType(png)).toBe('image/png')
  })

  it('detects JPEG', () => {
    expect(sniffImageContentType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
  })

  it('detects WebP', () => {
    const buf = new Uint8Array(12)
    buf.set([0x52, 0x49, 0x46, 0x46])
    buf.set([0x57, 0x45, 0x42, 0x50], 8)
    expect(sniffImageContentType(buf)).toBe('image/webp')
  })

  it('returns null for unknown', () => {
    expect(sniffImageContentType(new Uint8Array([1, 2, 3]))).toBeNull()
  })
})
