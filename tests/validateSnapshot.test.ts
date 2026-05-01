import { describe, expect, it } from 'vitest'
import { MEMORY_SNAPSHOT_VERSION } from '~/models/snapshot'
import {
  isSnapshotVersionCompatible,
  parseImportSnapshotPayload,
} from '~/utils/validateSnapshot'

describe('validateSnapshot', () => {
  it('parses valid import payload', () => {
    const out = parseImportSnapshotPayload({
      snapshotVersion: MEMORY_SNAPSHOT_VERSION,
      items: [
        {
          agentId: 'main',
          content: 'x',
          source: 'manual',
        },
      ],
    })
    expect(out.items).toHaveLength(1)
    expect(out.items[0].agentId).toBe('main')
  })

  it('rejects incompatible major version', () => {
    expect(() =>
      parseImportSnapshotPayload({
        snapshotVersion: '99.0.0',
        items: [{ agentId: 'main', content: 'x', source: 'manual' }],
      }),
    ).toThrow(/Unsupported snapshot version/)
  })

  it('isSnapshotVersionCompatible matches major', () => {
    expect(isSnapshotVersionCompatible(MEMORY_SNAPSHOT_VERSION)).toBe(true)
    expect(isSnapshotVersionCompatible(`${MEMORY_SNAPSHOT_VERSION}.build`)).toBe(true)
  })
})
