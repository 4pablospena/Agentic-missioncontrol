<script setup lang="ts">
import type { AgentTask, TaskEventRecord } from '~/models/task'
import type { LogEntry } from '~/models/log'

defineProps<{
  task: AgentTask | null
  events: TaskEventRecord[]
  logs: LogEntry[]
  pending: boolean
}>()

const emit = defineEmits<{
  close: []
  retry: [id: string]
  cancel: [id: string]
}>()

function formatJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  }
  catch {
    return String(v)
  }
}
</script>

<template>
  <div v-if="task" class="flex flex-col gap-4">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 class="text-highlighted text-lg font-semibold">
          {{ task.title }}
        </h2>
        <p v-if="task.description" class="text-muted mt-1 text-sm">
          {{ task.description }}
        </p>
      </div>
      <TasksTaskStatusBadge :status="task.status" />
    </div>

    <TasksTaskProgressBar :progress="task.progress" />

    <div class="text-muted grid gap-1 text-xs">
      <div><span class="font-medium text-highlighted">ID:</span> {{ task.id }}</div>
      <div><span class="font-medium text-highlighted">Priority:</span> {{ task.priority }}</div>
      <div v-if="task.assignedAgentId">
        <span class="font-medium text-highlighted">Agent:</span> {{ task.assignedAgentId }}
      </div>
      <div><span class="font-medium text-highlighted">Created:</span> {{ task.createdAt }}</div>
      <div><span class="font-medium text-highlighted">Updated:</span> {{ task.updatedAt }}</div>
    </div>

    <div v-if="task.input && Object.keys(task.input).length" class="flex flex-col gap-1">
      <span class="text-highlighted text-sm font-medium">Input</span>
      <pre class="bg-muted max-h-40 overflow-auto rounded-md p-3 text-xs">{{ formatJson(task.input) }}</pre>
    </div>

    <div v-if="task.result !== undefined && task.result !== null" class="flex flex-col gap-1">
      <span class="text-highlighted text-sm font-medium">Result</span>
      <pre class="bg-muted max-h-40 overflow-auto rounded-md p-3 text-xs">{{ formatJson(task.result) }}</pre>
    </div>

    <div v-if="task.error" class="flex flex-col gap-1">
      <span class="text-error text-sm font-medium">Error</span>
      <pre class="bg-muted max-h-40 overflow-auto rounded-md p-3 text-xs">{{ task.error }}</pre>
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="task.status === 'failed'"
        label="Retry"
        color="neutral"
        variant="outline"
        size="sm"
        @click="emit('retry', task.id)"
      />
      <UButton
        v-if="task.status === 'queued' || task.status === 'running' || task.status === 'scheduled'"
        label="Cancel"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="emit('cancel', task.id)"
      />
      <UButton label="Close" color="neutral" variant="soft" size="sm" @click="emit('close')" />
    </div>

    <div class="border-default border-t" />

    <div>
      <h3 class="text-highlighted mb-2 text-sm font-semibold">
        Events ({{ events.length }})
      </h3>
      <ul class="text-muted max-h-48 space-y-2 overflow-y-auto text-xs">
        <li v-for="ev in events" :key="ev.id" class="border-default rounded border px-2 py-1">
          <span class="text-highlighted font-medium">{{ ev.type }}</span>
          · {{ ev.createdAt }}
          <pre class="bg-muted mt-1 overflow-x-auto rounded p-1">{{ formatJson(ev.payload) }}</pre>
        </li>
      </ul>
    </div>

    <div>
      <h3 class="text-highlighted mb-2 text-sm font-semibold">
        Related logs ({{ logs.length }})
      </h3>
      <ul class="text-muted max-h-48 space-y-2 overflow-y-auto text-xs">
        <li v-for="log in logs" :key="log.id" class="border-default rounded border px-2 py-1">
          <span class="capitalize">{{ log.level }}</span>
          · {{ log.createdAt }}
          <div>{{ log.message }}</div>
        </li>
      </ul>
    </div>

    <div v-if="pending" class="text-muted text-xs">
      Loading…
    </div>
  </div>
  <div v-else class="text-muted text-sm">
    Select a task to view details.
  </div>
</template>
