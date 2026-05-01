/** @vitest-environment happy-dom */
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CreateTaskForm from '../components/tasks/CreateTaskForm.vue'

/** Register lightweight stand-ins by name — Vitest has no Nuxt auto-import resolver for `<UInput>` etc. */
const testGlobals = {
  UCard: defineComponent({
    name: 'UCard',
    template: '<div><slot name="header" /><slot /></div>',
  }),
  UFormField: defineComponent({
    name: 'UFormField',
    template: '<div><slot /></div>',
  }),
  UInput: defineComponent({
    name: 'UInput',
    inheritAttrs: false,
    props: {
      modelValue: { type: String, default: '' },
      placeholder: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, attrs }) {
      return () =>
        h('input', {
          placeholder: props.placeholder,
          class: attrs.class,
          'data-testid': attrs['data-testid'] as string | undefined,
          value: props.modelValue ?? '',
          onInput: (e: Event) =>
            emit('update:modelValue', (e.target as HTMLInputElement).value),
        })
    },
  }),
  UTextarea: defineComponent({
    name: 'UTextarea',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', ($event.target).value)" />',
  }),
  UAlert: defineComponent({ name: 'UAlert', template: '<div />' }),
  UButton: defineComponent({
    name: 'UButton',
    inheritAttrs: false,
    props: ['label', 'type'],
    setup(props, { attrs }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            type: (props.type as string | undefined) ?? 'button',
          },
          () => props.label,
        )
    },
  }),
  USelectMenu: defineComponent({
    name: 'USelectMenu',
    props: ['modelValue'],
    template: '<div />',
  }),
}

describe('CreateTaskForm', () => {
  it('emits submit with CreateTaskPayload', async () => {
    const onSubmit = vi.fn()

    const w = mount(CreateTaskForm, {
      props: {
        agentOptions: [{ label: 'Agent A', value: 'agent-a' }],
      },
      attrs: { onSubmit },
      global: {
        components: testGlobals,
      },
    })

    const titleField = w.find('input[placeholder="Short title"]')
    expect(titleField.exists()).toBe(true)
    const el = titleField.element as HTMLInputElement
    el.value = 'My task'
    await titleField.trigger('input')
    await nextTick()

    expect((titleField.element as HTMLInputElement).value).toBe('My task')

    expect(w.findAll('form')).toHaveLength(1)

    const formEl = w.find('form').element as HTMLFormElement
    formEl.requestSubmit()

    await nextTick()

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0]![0]
    expect(payload).toMatchObject({
      title: 'My task',
      priority: 'normal',
    })

    w.unmount()
  })
})
