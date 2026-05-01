<script setup lang="ts">
import { ref } from 'vue'
import type { ScheduleTaskPayload } from '~/models/scheduler'
import type { TaskPriority } from '~/models/task'

const emit = defineEmits<{
  submit: [payload: ScheduleTaskPayload]
}>()

const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('normal')
const assignedAgentId = ref('')
const cronExpression = ref('*/5 * * * *')
const enabled = ref(true)

function onSubmit() {
  if (!title.value.trim()) {
    return
  }
  const payload: ScheduleTaskPayload = {
    cronExpression: cronExpression.value.trim(),
    enabled: enabled.value,
    taskTemplate: {
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      priority: priority.value,
      assignedAgentId: assignedAgentId.value.trim() || undefined,
    },
  }
  emit('submit', payload)
}
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-6' }">
    <template #header>
      <span class="text-highlighted font-semibold">New schedule</span>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UFormField label="Cron expression" required>
        <UInput
          v-model="cronExpression"
          class="font-mono w-full text-sm"
          placeholder="*/5 * * * *"
          data-testid="schedule-cron-input"
        />
      </UFormField>

      <UFormField label="Task title" required>
        <UInput
          v-model="title"
          placeholder="Title for spawned tasks"
          class="w-full"
          data-testid="schedule-title-input"
        />
      </UFormField>

      <UFormField label="Description">
        <UTextarea v-model="description" class="w-full" />
      </UFormField>

      <UFormField label="Priority">
        <select
          v-model="priority"
          class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
        >
          <option value="low">
            low
          </option>
          <option value="normal">
            normal
          </option>
          <option value="high">
            high
          </option>
          <option value="critical">
            critical
          </option>
        </select>
      </UFormField>

      <UFormField label="Agent id (optional)">
        <UInput v-model="assignedAgentId" placeholder="assignedAgentId" class="w-full" />
      </UFormField>

      <label class="flex items-center gap-2 text-sm">
        <input v-model="enabled" type="checkbox" class="rounded border">
        <span>Enabled</span>
      </label>

      <UButton type="submit" label="Save schedule" block data-testid="schedule-submit" />
    </form>
  </UCard>
</template>
