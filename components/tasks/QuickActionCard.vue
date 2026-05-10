<script setup lang="ts">
import type { QuickAction } from '~/config/task-templates'

const props = defineProps<{
  action: QuickAction
  agentId: string
  agentStatus: string
  loading?: boolean
}>()

const emit = defineEmits<{
  execute: [agentId: string, action: QuickAction]
}>()

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
  green: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
  purple: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50',
  orange: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50',
  indigo: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50',
}

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-500',
  green: 'text-emerald-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  indigo: 'text-indigo-500',
}

const btnColorMap: Record<string, 'primary' | 'success' | 'secondary' | 'warning' | 'info'> = {
  blue: 'primary',
  green: 'success',
  purple: 'secondary',
  orange: 'warning',
  indigo: 'info',
}

const isOffline = computed(() => props.agentStatus === 'offline' || props.agentStatus === 'error')
const isBusy = computed(() => props.agentStatus === 'running')
</script>

<template>
  <div
    class="group flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200"
    :class="[
      colorMap[action.color] ?? colorMap.blue,
      isOffline ? 'opacity-50' : '',
    ]"
  >
    <!-- Icon + label -->
    <div class="flex items-start gap-3">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl"
        :class="`bg-${action.color === 'green' ? 'emerald' : action.color}-500/15`"
      >
        <UIcon
          :name="action.icon"
          class="size-5"
          :class="iconColorMap[action.color] ?? 'text-primary'"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-highlighted font-semibold leading-tight">
          {{ action.label }}
        </p>
        <p class="text-muted mt-1 text-xs leading-snug">
          {{ action.description }}
        </p>
      </div>
    </div>

    <!-- CTA -->
    <UButton
      :label="isBusy ? 'En curso…' : isOffline ? 'Agente no disponible' : 'Ejecutar ahora'"
      :icon="isBusy ? 'i-lucide-loader-circle' : 'i-lucide-play'"
      :loading="loading || isBusy"
      :disabled="isOffline"
      block
      size="sm"
      @click="emit('execute', agentId, action)"
    />
  </div>
</template>
