/** @vitest-environment happy-dom */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CreateTaskForm from '../components/tasks/CreateTaskForm.vue'

const stubs = {
  UCard: { template: '<div><slot name="header" /><slot /></div>' },
  UFormField: { template: '<div><slot /></div>', props: ['label', 'required'] },
  UInput: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', ($event.target).value)" />',
  },
  UTextarea: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', ($event.target).value)" />',
  },
  UAlert: { template: '<div />', props: ['color', 'variant', 'title'] },
  UButton: { template: '<button type="submit"><slot /></button>', props: ['label', 'type'] },
}

describe('CreateTaskForm', () => {
  it('emits submit with CreateTaskPayload', async () => {
    const w = mount(CreateTaskForm, {
      global: { stubs },
    })

    const inputs = w.findAll('input')
    await inputs[0]!.setValue('My task')

    await w.find('form').trigger('submit.prevent')

    expect(w.emitted('submit')).toBeTruthy()
    const payload = w.emitted('submit')?.[0]?.[0]
    expect(payload).toMatchObject({
      title: 'My task',
      priority: 'normal',
    })

    w.unmount()
  })
})
