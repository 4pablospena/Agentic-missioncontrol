<script setup lang="ts">
import type { AgentTask, TaskStatus } from '~/models/task'

type RetroColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

interface ColumnDef {
  status: TaskStatus
  title: string
  color: RetroColor
}

const PIPELINE: ColumnDef[] = [
  { status: 'scheduled', title: 'PROGRAMADAS', color: 'cyan' },
  { status: 'queued',    title: 'EN COLA',     color: 'neutral' },
  { status: 'running',   title: 'EN CURSO',    color: 'yellow' },
]

const ARCHIVE: ColumnDef[] = [
  { status: 'completed', title: 'COMPLETADAS', color: 'green' },
  { status: 'failed',    title: 'FALLIDAS',    color: 'red' },
  { status: 'cancelled', title: 'CANCELADAS',  color: 'neutral' },
]

const props = defineProps<{
  grouped: Record<TaskStatus, AgentTask[]>
  tasksPending?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()

const archiveTotal = computed(() =>
  (props.grouped.completed?.length ?? 0)
  + (props.grouped.failed?.length ?? 0)
  + (props.grouped.cancelled?.length ?? 0),
)

const archiveOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Pipeline -->
    <section>
      <RetroSectionLabel label="Pipeline activo" color="yellow" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TasksTaskColumn
          v-for="col in PIPELINE"
          :key="col.status"
          :title="col.title"
          :status="col.status"
          :color="col.color"
          :tasks="grouped[col.status] ?? []"
          @select="emit('select', $event)"
          @retry="emit('retry', $event)"
          @cancel="emit('cancel', $event)"
        />
      </div>
    </section>

    <!-- Archive -->
    <section v-if="archiveTotal > 0">
      <button
        type="button"
        class="rs-archive-toggle w-full flex items-center justify-between gap-3 mb-4"
        @click="archiveOpen = !archiveOpen"
      >
        <RetroSectionLabel
          label="Archivo"
          color="neutral"
          :count="archiveTotal"
          class="!mb-0 flex-1"
        />
        <UIcon
          :name="archiveOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 shrink-0"
          style="color: var(--rs-text-dim);"
        />
      </button>

      <div v-show="archiveOpen" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TasksTaskColumn
          v-for="col in ARCHIVE"
          :key="col.status"
          :title="col.title"
          :status="col.status"
          :color="col.color"
          :tasks="grouped[col.status] ?? []"
          @select="emit('select', $event)"
          @retry="emit('retry', $event)"
          @cancel="emit('cancel', $event)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.rs-archive-toggle {
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  text-align: left;
}

.rs-archive-toggle:hover :deep(.rs-display) {
  color: var(--rs-cyan) !important;
  text-shadow: 0 0 8px var(--rs-cyan);
}
</style>
