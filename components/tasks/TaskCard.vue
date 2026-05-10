<script setup lang="ts">
import type { AgentTask } from '~/models/task'

defineProps<{ task: AgentTask }>()

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()

type RetroColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

function statusColor(status: string): RetroColor {
  const map: Record<string, RetroColor> = {
    queued:    'neutral',
    running:   'yellow',
    completed: 'green',
    failed:    'red',
    cancelled: 'neutral',
    scheduled: 'cyan',
  }
  return map[status] ?? 'neutral'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    queued:    'EN COLA',
    running:   'ACTIVA',
    completed: 'OK',
    failed:    'FALLO',
    cancelled: 'CANCEL.',
    scheduled: 'PROG.',
  }
  return map[status] ?? status.toUpperCase()
}
</script>

<template>
  <RetroCard
    :color="statusColor(task.status)"
    :active="task.status === 'running'"
    interactive
    static
    class="rs-task-card"
    @click="emit('select', task.id)"
  >
    <div class="flex flex-col gap-2.5">
      <!-- Title + status -->
      <div class="flex items-start gap-2.5">
        <span
          v-if="task.status === 'running'"
          class="relative flex size-2 shrink-0 mt-1.5"
        >
          <span class="absolute inline-flex size-full animate-ping opacity-75 rounded-full" style="background: var(--rs-yellow);" />
          <span class="relative inline-flex size-2 rounded-full" style="background: var(--rs-yellow);" />
        </span>
        <span
          v-else
          class="rs-dot shrink-0 mt-1.5"
          :class="`rs-dot--${task.status === 'completed' ? 'idle' : task.status === 'failed' ? 'error' : 'offline'}`"
        />
        <p class="rs-body rs-task-card__title">
          {{ task.title }}
        </p>
      </div>

      <!-- Progress -->
      <div
        v-if="task.status === 'running' && task.progress > 0"
        class="rs-progress-track"
      >
        <div class="rs-progress-fill" :style="{ width: `${task.progress}%` }" />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <RetroBadge :color="statusColor(task.status)" size="sm">
          {{ statusLabel(task.status) }}
        </RetroBadge>

        <div class="flex gap-1.5" @click.stop>
          <RetroButton
            v-if="task.status === 'failed'"
            color="cyan"
            variant="outline"
            size="sm"
            icon="i-lucide-rotate-ccw"
            @click="emit('retry', task.id)"
          >
            Reintentar
          </RetroButton>
          <RetroButton
            v-if="['queued','running','scheduled'].includes(task.status)"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            @click="emit('cancel', task.id)"
          >
            Cancelar
          </RetroButton>
        </div>
      </div>

      <!-- Error -->
      <p v-if="task.error" class="rs-body rs-task-card__error">
        ⚠ {{ task.error }}
      </p>
    </div>
  </RetroCard>
</template>

<style scoped>
.rs-task-card {
  padding: 0.85rem 1rem;
}

.rs-task-card__title {
  font-size: var(--rs-text-md);
  flex: 1;
  min-width: 0;
  line-height: 1.4;
  font-weight: 500;
  color: var(--rs-text);
}

.rs-task-card__error {
  font-size: var(--rs-text-sm);
  color: var(--rs-red);
  text-shadow: 0 0 6px rgba(255, 56, 96, 0.3);
  line-height: 1.3;
}

.rs-progress-track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;
}
.rs-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rs-yellow), var(--rs-orange));
  box-shadow: 0 0 8px var(--rs-yellow);
  transition: width 300ms ease;
}
</style>
