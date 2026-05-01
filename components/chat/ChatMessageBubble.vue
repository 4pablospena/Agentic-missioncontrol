<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '~/models/chat'

const props = defineProps<{
  message: ChatMessage
}>()

const isUser = computed(() => props.message.role === 'user')
</script>

<template>
  <div
    class="flex"
    :class="isUser ? 'justify-end' : 'justify-start'"
    data-testid="chat-message-bubble"
  >
    <div
      class="max-w-[min(640px,85%)] rounded-lg px-3 py-2 text-sm shadow-sm"
      :class="isUser
        ? 'bg-primary text-white'
        : 'bg-elevated text-default border-default border'"
    >
      <div class="text-[10px] font-medium uppercase opacity-70">
        {{ message.role }}
      </div>
      <p class="mt-1 whitespace-pre-wrap">
        {{ message.content }}
      </p>
      <div class="mt-1 text-[10px] opacity-60">
        {{ message.createdAt }}
      </div>
    </div>
  </div>
</template>
