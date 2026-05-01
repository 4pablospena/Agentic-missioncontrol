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

function isoToDayInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const fromDay = computed({
  get() {
    const raw = props.modelValue.from?.trim()
    return raw ? isoToDayInput(raw) : ''
  },
  set(v: string) {
    const t = v.trim()
    if (!t) {
      patch({ from: undefined })
      return
    }
    const start = new Date(`${t}T00:00:00`)
    patch({ from: Number.isNaN(start.getTime()) ? undefined : start.toISOString() })
  },
})

const toDay = computed({
  get() {
    const raw = props.modelValue.to?.trim()
    return raw ? isoToDayInput(raw) : ''
  },
  set(v: string) {
    const t = v.trim()
    if (!t) {
      patch({ to: undefined })
      return
    }
    const end = new Date(`${t}T23:59:59.999`)
    patch({ to: Number.isNaN(end.getTime()) ? undefined : end.toISOString() })
  },
})

function presetDays(days: number) {
  const to = new Date()
  const from = new Date(to.getTime() - days * 86_400_000)
  patch({ from: from.toISOString(), to: to.toISOString() })
}

function clearDateRange() {
  patch({ from: undefined, to: undefined })
}

const agentMenuItems = computed(() => [
  { label: 'Any agent', value: '' },
  ...props.agentOptions,
])
</script>

<template>
  <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    <UFormField label="Agent">
      <USelectMenu
        v-model="agentSelect"
        :items="agentMenuItems"
        value-key="value"
        label-key="label"
        placeholder="Any agent"
        :search-input="false"
        class="w-full"
        data-testid="memory-filter-agent"
      />
    </UFormField>
    <UFormField label="Session id">
      <UInput v-model="sessionId" placeholder="Optional" data-testid="memory-filter-session" />
    </UFormField>
    <UFormField label="Source">
      <USelectMenu
        v-model="sourceSelect"
        :items="sourceOptions"
        value-key="value"
        label-key="label"
        placeholder="Any source"
        :search-input="false"
        class="w-full"
        data-testid="memory-filter-source"
      />
    </UFormField>
    <div class="col-span-full flex flex-wrap items-center gap-2">
      <span class="text-muted text-xs font-medium">Created range</span>
      <UButton size="xs" variant="ghost" label="Last 7 days" @click="presetDays(7)" />
      <UButton size="xs" variant="ghost" label="Last 30 days" @click="presetDays(30)" />
      <UButton size="xs" variant="ghost" label="Clear dates" @click="clearDateRange()" />
    </div>
    <UFormField
      label="From"
      description="Calendar uses local day; filters apply ISO timestamps."
    >
      <UInput
        v-model="fromDay"
        type="date"
        class="w-full"
        data-testid="memory-filter-from"
      />
    </UFormField>
    <UFormField
      label="To"
      description="End of selected local day."
    >
      <UInput
        v-model="toDay"
        type="date"
        class="w-full"
        data-testid="memory-filter-to"
      />
    </UFormField>
  </div>
</template>
