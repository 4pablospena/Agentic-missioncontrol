<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  disabled?: boolean
  sending?: boolean
}>()

const emit = defineEmits<{
  submit: [content: string]
}>()

const text = ref('')

function submitMessage() {
  const v = text.value.trim()
  if (!v || props.disabled)
    return
  emit('submit', v)
  text.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter')
    return
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    submitMessage()
  }
}
</script>

<template>
  <form class="flex flex-col gap-2 border-default border-t pt-4" @submit.prevent="submitMessage">
    <UFormField label="Message" class="w-full">
      <UTextarea
        v-model="text"
        placeholder="Message the agent…"
        aria-label="Message"
        class="w-full"
        :rows="3"
        :disabled="disabled"
        data-testid="chat-composer-input"
        @keydown="onKeydown"
      />
    </UFormField>
    <p class="text-muted text-xs">
      Enter new line · Ctrl+Enter or ⌘+Enter send
    </p>
    <div class="flex justify-end">
      <UButton
        type="submit"
        icon="i-lucide-send"
        :label="sending ? 'Sending…' : 'Send'"
        :loading="sending"
        :disabled="disabled"
        data-testid="chat-composer-submit"
      />
    </div>
  </form>
</template>
