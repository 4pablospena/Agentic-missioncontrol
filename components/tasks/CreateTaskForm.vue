<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreateTaskPayload, TaskPriority } from '~/models/task'

const props = defineProps<{
  agentOptions?: { label: string, value: string }[]
}>()

const priorityItems: { label: string, value: TaskPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

const agentMenuItems = computed(() => [
  { label: 'Unassigned', value: '' },
  ...(props.agentOptions ?? []),
])

const emit = defineEmits<{
  submit: [payload: CreateTaskPayload]
}>()

const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('normal')
const assignedAgentId = ref('')
const inputJson = ref('')

const localError = ref('')

function onSubmit() {
  localError.value = ''
  if (!title.value.trim()) {
    localError.value = 'Title is required'
    return
  }
  let input: Record<string, unknown> | undefined
  const raw = inputJson.value.trim()
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        localError.value = 'Input JSON must be an object'
        return
      }
      input = parsed as Record<string, unknown>
    }
    catch {
      localError.value = 'Invalid JSON for input'
      return
    }
  }

  const payload: CreateTaskPayload = {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    priority: priority.value,
    assignedAgentId: assignedAgentId.value.trim() || undefined,
    input,
  }
  emit('submit', payload)
}
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-6' }">
    <template #header>
      <span class="text-highlighted font-semibold">Create task</span>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UFormField label="Title" required>
        <UInput
          v-model="title"
          placeholder="Short title"
          class="w-full"
          data-testid="create-task-title-input"
        />
      </UFormField>

      <UFormField label="Description">
        <UTextarea v-model="description" placeholder="Optional details" class="w-full" />
      </UFormField>

      <UFormField label="Priority">
        <USelectMenu
          v-model="priority"
          :items="priorityItems"
          value-key="value"
          label-key="label"
          placeholder="Priority"
          :search-input="false"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Agent (optional)">
        <USelectMenu
          v-if="props.agentOptions?.length"
          v-model="assignedAgentId"
          :items="agentMenuItems"
          value-key="value"
          label-key="label"
          placeholder="Unassigned"
          :search-input="false"
          class="w-full"
        />
        <UInput v-else v-model="assignedAgentId" placeholder="Agent id" class="w-full" />
      </UFormField>

      <UFormField label="Input JSON (optional object)">
        <UTextarea
          v-model="inputJson"
          placeholder='{"key":"value"}'
          class="font-mono w-full text-xs"
          :rows="4"
        />
      </UFormField>

      <UAlert
        v-if="localError"
        color="error"
        variant="soft"
        :title="localError"
        class="text-sm"
      />

      <UButton type="submit" label="Create task" block data-testid="create-task-submit" />
    </form>
  </UCard>
</template>
