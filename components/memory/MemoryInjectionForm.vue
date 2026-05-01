<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  agentId: string
}>()

const emit = defineEmits<{
  submit: [payload: { agentId: string, content: string, sessionId?: string }]
}>()

const content = ref('')
const sessionId = ref('')
const localError = ref('')

function onSubmit() {
  localError.value = ''
  if (!props.agentId.trim()) {
    localError.value = 'Pick an agent filter first'
    return
  }
  if (!content.value.trim()) {
    localError.value = 'Content is required'
    return
  }
  emit('submit', {
    agentId: props.agentId.trim(),
    content: content.value.trim(),
    sessionId: sessionId.value.trim() || undefined,
  })
  content.value = ''
}
</script>

<template>
  <UCard :ui="{ body: 'p-4 sm:p-6' }">
    <template #header>
      <span class="text-highlighted font-semibold">Inject manual memory</span>
    </template>
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <UAlert
        v-if="localError"
        color="error"
        variant="soft"
        :title="localError"
      />
      <UFormField label="Session id (optional)">
        <UInput v-model="sessionId" placeholder="conversation or trace id" data-testid="memory-inject-session" />
      </UFormField>
      <UFormField label="Content" required>
        <UTextarea
          v-model="content"
          class="w-full"
          :rows="5"
          placeholder="Context you want the agent to retrieve later…"
          data-testid="memory-inject-content"
        />
      </UFormField>
      <UButton
        type="submit"
        icon="i-lucide-plus"
        label="Inject"
        data-testid="memory-inject-submit"
      />
    </form>
  </UCard>
</template>
