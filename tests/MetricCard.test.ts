/** @vitest-environment happy-dom */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MetricCard from '../components/metrics/MetricCard.vue'

describe('MetricCard', () => {
  it('renders title and value', () => {
    const w = mount(MetricCard, {
      props: { title: 'Items', value: 42 },
    })
    expect(w.text()).toContain('Items')
    expect(w.text()).toContain('42')
  })
})
