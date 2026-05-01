<script setup lang="ts">
import type { LogEntry } from '~/models/log'
import type { LogFilters } from '~/models/log-filters'

const props = defineProps<{
  modelValue: LogFilters
  agentOptions?: { label: string, value: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [LogFilters]
  apply: []
  reset: []
}>()

function patch(p: Partial<LogFilters>) {
  emit('update:modelValue', { ...props.modelValue, ...p })
}

function onLevelChange(ev: Event) {
  const raw = (ev.target as HTMLSelectElement).value
  const level = raw as LogEntry['level'] | ''
  patch({
    level:
      level === 'debug'
      || level === 'info'
      || level === 'warn'
      || level === 'error'
        ? level
        : undefined,
  })
}

function onAgentChange(ev: Event) {
  const v = (ev.target as HTMLSelectElement).value
  patch({ agentId: v || undefined })
}
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
    <UFormField label="Agent" class="min-w-[160px] flex-1">
      <select
        v-if="agentOptions?.length"
        class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
        :value="modelValue.agentId ?? ''"
        @change="onAgentChange"
      >
        <option value="">
          Any
        </option>
        <option
          v-for="opt in agentOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <UInput
        v-else
        :model-value="modelValue.agentId ?? ''"
        placeholder="Agent id"
        class="w-full"
        @update:model-value="(v: string) => patch({ agentId: v || undefined })"
      />
    </UFormField>

    <UFormField label="Level" class="w-full min-w-[140px] lg:w-40">
      <select
        class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
        :value="modelValue.level ?? ''"
        @change="onLevelChange"
      >
        <option value="">
          Any
        </option>
        <option value="debug">
          debug
        </option>
        <option value="info">
          info
        </option>
        <option value="warn">
          warn
        </option>
        <option value="error">
          error
        </option>
      </select>
    </UFormField>

    <UFormField label="Search" class="min-w-[200px] flex-1">
      <UInput
        :model-value="modelValue.query ?? ''"
        placeholder="Message contains…"
        class="w-full"
        @update:model-value="(v: string) => patch({ query: v || undefined })"
      />
    </UFormField>

    <UFormField label="From (ISO)" class="min-w-[180px] flex-1">
      <UInput
        :model-value="modelValue.from ?? ''"
        placeholder="2026-01-01T00:00:00Z"
        class="w-full"
        @update:model-value="(v: string) => patch({ from: v || undefined })"
      />
    </UFormField>

    <UFormField label="To (ISO)" class="min-w-[180px] flex-1">
      <UInput
        :model-value="modelValue.to ?? ''"
        placeholder="2026-12-31T23:59:59Z"
        class="w-full"
        @update:model-value="(v: string) => patch({ to: v || undefined })"
      />
    </UFormField>

    <div class="flex flex-wrap gap-2">
      <UButton color="primary" label="Apply" @click="emit('apply')" />
      <UButton color="neutral" variant="outline" label="Reset" @click="emit('reset')" />
    </div>
  </div>
</template>
