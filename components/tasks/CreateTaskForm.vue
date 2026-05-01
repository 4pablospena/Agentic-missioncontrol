<script setup lang="ts">
import { ref } from 'vue'
import type { CreateTaskPayload, TaskPriority } from '~/models/task'

const props = defineProps<{
  agentOptions?: { label: string, value: string }[]
}>()

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

      <UFormField label="Agent (optional)">
        <select
          v-if="props.agentOptions?.length"
          v-model="assignedAgentId"
          class="border-default bg-default ring-default w-full rounded-md border px-3 py-2 text-sm ring"
        >
          <option value="">
            Unassigned
          </option>
          <option
            v-for="opt in props.agentOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
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
