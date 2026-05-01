import { describe, expect, it } from 'vitest'
import { assertTransition, canTransition } from '~/utils/taskTransitions'

describe('taskTransitions', () => {
  it('allows queued -> running and queued -> cancelled', () => {
    expect(canTransition('queued', 'running')).toBe(true)
    expect(canTransition('queued', 'cancelled')).toBe(true)
    expect(canTransition('queued', 'completed')).toBe(false)
  })

  it('allows running terminal transitions', () => {
    expect(canTransition('running', 'completed')).toBe(true)
    expect(canTransition('running', 'failed')).toBe(true)
    expect(canTransition('running', 'cancelled')).toBe(true)
  })

  it('allows failed -> queued (retry)', () => {
    expect(canTransition('failed', 'queued')).toBe(true)
  })

  it('allows scheduled -> queued and scheduled -> cancelled', () => {
    expect(canTransition('scheduled', 'queued')).toBe(true)
    expect(canTransition('scheduled', 'cancelled')).toBe(true)
  })

  it('rejects completed/cancelled outbound', () => {
    expect(canTransition('completed', 'queued')).toBe(false)
    expect(canTransition('cancelled', 'queued')).toBe(false)
  })

  it('assertTransition throws on invalid', () => {
    expect(() => assertTransition('completed', 'running')).toThrow()
  })
})
