<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { ChatMessage } from '~/models/chat'
import ChatMessageBubble from './ChatMessageBubble.vue'

const props = defineProps<{
  messages: ChatMessage[]
}>()

const root = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    const el = root.value
    if (!el)
      return
    el.scrollTop = el.scrollHeight
  })
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.messages, scrollToBottom, { deep: true })

onMounted(scrollToBottom)
</script>

<template>
  <div
    ref="root"
    class="flex max-h-[min(560px,55vh)] flex-col gap-3 overflow-y-auto pr-1"
    data-testid="chat-message-list"
  >
    <ChatMessageBubble v-for="m in messages" :key="m.id" :message="m" />
  </div>
</template>
