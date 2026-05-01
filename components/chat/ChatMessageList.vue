<script setup lang="ts">
import type { ChatMessage } from '~/models/chat'
import ChatMessageBubble from './ChatMessageBubble.vue'

defineProps<{
  messages: ChatMessage[]
}>()
</script>

<template>
  <div class="flex max-h-[min(560px,55vh)] flex-col gap-3 overflow-y-auto pr-1" data-testid="chat-message-list">
    <ChatMessageBubble v-for="m in messages" :key="m.id" :message="m" />
  </div>
</template>
