<script setup lang="ts">
import { computed } from 'vue'
import type { MemoryListFilters, MemorySource } from '~/models/memory'

const props = defineProps<{
  modelValue: MemoryListFilters & { limit?: number }
  agentOptions: { label: string, value: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MemoryListFilters & { limit?: number }]
}>()

const sourceOptions: { label: string, value: MemorySource | '' }[] = [
  { label: 'Any source', value: '' },
  { label: 'Chat', value: 'chat' },
  { label: 'Task', value: 'task' },
  { label: 'Manual', value: 'manual' },
  { label: 'System', value: 'system' },
]

function patch(partial: Partial<MemoryListFilters & { limit?: number }>) {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}

const agentSelect = computed({
  get: () => props.modelValue.agentId ?? '',
  set: (v: string) => patch({ agentId: v || undefined }),
})

const sourceSelect = computed({
  get: () => props.modelValue.source ?? '',
  set: (v: MemorySource | '') => patch({ source: v || undefined }),
})

const sessionId = computed({
  get: () => props.modelValue.sessionId ?? '',
  set: (v: string) => patch({ sessionId: v || undefined }),
})

const from = computed({
  get: () => props.modelValue.from ?? '',
  set: (v: string) => patch({ from: v || undefined }),
})

const to = computed({
  get: () => props.modelValue.to ?? '',
  set: (v: string) => patch({ to: v || undefined }),
})
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    <UFormField label="Agent">
      <select
        v-model="agentSelect"
        class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
        data-testid="memory-filter-agent"
      >
        <option value="">
          Any agent
        </option>
        <option v-for="opt in agentOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </UFormField>
    <UFormField label="Session id">
      <UInput v-model="sessionId" placeholder="Optional" data-testid="memory-filter-session" />
    </UFormField>
    <UFormField label="Source">
      <select
        v-model="sourceSelect"
        class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
        data-testid="memory-filter-source"
      >
        <option v-for="opt in sourceOptions" :key="String(opt.value)" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </UFormField>
    <UFormField label="From (ISO date)">
      <UInput v-model="from" placeholder="2026-01-01T00:00:00.000Z" data-testid="memory-filter-from" />
    </UFormField>
    <UFormField label="To (ISO date)">
      <UInput v-model="to" placeholder="2026-12-31T23:59:59.999Z" data-testid="memory-filter-to" />
    </UFormField>
  </div>
</template>
