import { describe, expect, it } from 'vitest'
import { parseAgentsFromOpenclawConfig } from '../server/utils/openclaw-config-fs'

describe('openclaw-config-fs', () => {
  it('parseAgentsFromOpenclawConfig maps agents.list with defaults.model primary', () => {
    const parsed = {
      agents: {
        defaults: {
          model: { primary: 'ollama/kimi-k2.5:cloud', fallbacks: [] },
        },
        list: [
          { id: 'main', name: 'Main' },
          { id: 'studio', name: 'Studio', model: { primary: 'ollama/other:cloud' } },
        ],
      },
    }
    const agents = parseAgentsFromOpenclawConfig(parsed)
    expect(agents.map(a => a.id)).toEqual(['main', 'studio'])
    expect(agents[0]?.model).toBe('ollama/kimi-k2.5:cloud')
    expect(agents[1]?.model).toBe('ollama/other:cloud')
    expect(agents[0]?.status).toBe('idle')
  })

  it('parseAgentsFromOpenclawConfig returns empty when malformed', () => {
    expect(parseAgentsFromOpenclawConfig(null)).toEqual([])
    expect(parseAgentsFromOpenclawConfig({})).toEqual([])
    expect(parseAgentsFromOpenclawConfig({ agents: {} })).toEqual([])
  })
})
