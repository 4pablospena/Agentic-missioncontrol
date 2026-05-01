/** @vitest-environment happy-dom */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AgentStatusBadge from '../components/agents/AgentStatusBadge.vue'

describe('AgentStatusBadge', () => {
  it('shows status label', () => {
    const w = mount(AgentStatusBadge, {
      props: { status: 'running' },
    })
    expect(w.text()).toContain('running')
  })
})
