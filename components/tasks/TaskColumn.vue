<script setup lang="ts">
import type { AgentTask, TaskStatus } from '~/models/task'

type RetroColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

withDefaults(
  defineProps<{
    title: string
    status: TaskStatus
    tasks: AgentTask[]
    color?: RetroColor
  }>(),
  { color: 'cyan' },
)

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()
</script>

<template>
  <div class="rs-column">
    <!-- Header -->
    <div class="rs-column__header">
      <p
        class="rs-display rs-column__title"
        :class="{
          'rs-glow-pink':   color === 'pink',
          'rs-glow-cyan':   color === 'cyan',
          'rs-glow-purple': color === 'purple',
          'rs-glow-yellow': color === 'yellow',
          'rs-glow-orange': color === 'orange',
          'rs-glow-green':  color === 'green',
          'rs-glow-red':    color === 'red',
        }"
        :style="color === 'neutral' ? { color: 'var(--rs-text-muted)' } : {}"
      >
        {{ title }}
      </p>
      <RetroBadge :color="color" size="sm">{{ tasks.length }}</RetroBadge>
    </div>

    <!-- Tasks -->
    <div class="rs-column__body">
      <TasksTaskCard
        v-for="t in tasks"
        :key="t.id"
        :task="t"
        @select="emit('select', $event)"
        @retry="emit('retry', $event)"
        @cancel="emit('cancel', $event)"
      />

      <div v-if="!tasks.length" class="rs-column__empty">
        <p class="rs-body" style="color: var(--rs-text-dim); font-size: var(--rs-text-sm);">
          [ vacío ]
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rs-column {
  background: linear-gradient(180deg, var(--rs-surface) 0%, color-mix(in srgb, var(--rs-bg) 80%, var(--rs-surface)) 100%);
  border: 1px solid var(--rs-border);
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: min(70vh, 40rem);
}

.rs-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--rs-border);
  background: rgba(0, 0, 0, 0.2);
}

.rs-column__title {
  font-size: var(--rs-text-sm);
  letter-spacing: 0.05em;
}

.rs-column__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.65rem;
  overflow-y: auto;
  min-height: 0;
}

.rs-column__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 0;
}
</style>
