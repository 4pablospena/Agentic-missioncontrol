<script setup lang="ts">
import type { TaskTemplate } from '~/config/task-templates'

defineProps<{
  selectedTemplate: TaskTemplate
  formError: string
}>()

const formValues = defineModel<Record<string, unknown>>('formValues', { required: true })

const emit = defineEmits<{
  submit: []
  cancel: []
}>()
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="emit('submit')">
    <template v-for="field in selectedTemplate.fields" :key="field.key">
      <div>
        <label class="rs-display text-[0.65rem] tracking-widest mb-2 block" style="color: var(--rs-cyan);">
          {{ field.label }}<span v-if="field.required" class="rs-glow-pink"> *</span>
        </label>

        <input
          v-if="field.type === 'text'"
          v-model="formValues[field.key] as string"
          :placeholder="field.placeholder"
          class="rs-input w-full"
        >

        <textarea
          v-else-if="field.type === 'textarea'"
          v-model="formValues[field.key] as string"
          :placeholder="field.placeholder"
          rows="3"
          class="rs-input w-full resize-y"
        />

        <select
          v-else-if="field.type === 'select'"
          v-model="formValues[field.key] as string"
          class="rs-input w-full"
        >
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <input
          v-else-if="field.type === 'number'"
          v-model.number="formValues[field.key] as number"
          type="number"
          class="rs-input w-full"
        >

        <label
          v-else-if="field.type === 'checkbox'"
          class="flex items-center gap-2.5 cursor-pointer rs-body text-base"
          style="color: var(--rs-text-muted);"
        >
          <input
            v-model="formValues[field.key] as boolean"
            type="checkbox"
            class="rs-checkbox"
          >
          {{ field.label }}
        </label>
      </div>
    </template>

    <RetroCard v-if="formError" color="red" static class="px-3 py-2">
      <p class="rs-body text-sm rs-glow-red">⚠ {{ formError }}</p>
    </RetroCard>

    <div class="flex justify-end gap-2 pt-1">
      <RetroButton
        color="neutral"
        variant="ghost"
        size="md"
        @click="emit('cancel')"
      >
        Cancelar
      </RetroButton>
      <RetroButton
        type="submit"
        color="pink"
        variant="solid"
        size="md"
        icon="i-lucide-send"
      >
        Enviar
      </RetroButton>
    </div>
  </form>
</template>

<style scoped>
.rs-input {
  font-family: var(--rs-font-body);
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  padding: 0.6rem 0.85rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--rs-border);
  color: var(--rs-text);
  transition: border-color 150ms, box-shadow 150ms;
  outline: none;
}

.rs-input::placeholder { color: var(--rs-text-dim); }

.rs-input:focus {
  border-color: var(--rs-cyan);
  box-shadow: 0 0 0 1px var(--rs-cyan), 0 0 16px color-mix(in srgb, var(--rs-cyan) 25%, transparent);
}

.rs-input:hover:not(:focus) {
  border-color: color-mix(in srgb, var(--rs-cyan) 40%, var(--rs-border));
}

select.rs-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2300f5ff' viewBox='0 0 16 16'%3E%3Cpath d='M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2rem;
  appearance: none;
}

.rs-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid var(--rs-border);
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  position: relative;
  transition: all 150ms;
}

.rs-checkbox:checked {
  border-color: var(--rs-pink);
  background: var(--rs-pink);
  box-shadow: 0 0 8px color-mix(in srgb, var(--rs-pink) 50%, transparent);
}

.rs-checkbox:checked::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rs-bg);
  font-size: 0.85rem;
  font-weight: bold;
}
</style>
