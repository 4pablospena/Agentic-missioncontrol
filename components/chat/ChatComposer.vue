<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [content: string]
}>()

const text = ref('')

function onSubmit() {
  const v = text.value.trim()
  if (!v)
    return
  emit('submit', v)
  text.value = ''
}
</script>

<template>
  <form class="flex flex-col gap-2 border-default border-t pt-4" @submit.prevent="onSubmit">
    <UTextarea
      v-model="text"
      placeholder="Message the agent…"
      class="w-full"
      :rows="3"
      :disabled="disabled"
      data-testid="chat-composer-input"
    />
    <div class="flex justify-end">
      <UButton
        type="submit"
        icon="i-lucide-send"
        label="Send"
        :disabled="disabled"
        data-testid="chat-composer-submit"
      />
    </div>
  </form>
</template>
