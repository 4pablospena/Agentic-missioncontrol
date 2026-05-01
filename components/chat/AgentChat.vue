<script setup lang="ts">
import type { ChatMessage, Conversation } from '~/models/chat'
import ChatComposer from './ChatComposer.vue'
import ChatMessageList from './ChatMessageList.vue'
import ConversationList from './ConversationList.vue'

defineProps<{
  conversations: Conversation[]
  messages: ChatMessage[]
  selectedConversationId: string | null
  pending?: boolean
  sending?: boolean
}>()

const emit = defineEmits<{
  selectConversation: [id: string]
  send: [content: string]
  newConversation: []
}>()
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]" data-testid="agent-chat">
    <UCard :ui="{ body: 'p-4' }">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <span class="text-highlighted text-sm font-semibold">Threads</span>
          <UButton
            icon="i-lucide-plus"
            size="xs"
            variant="ghost"
            label="New"
            data-testid="chat-new-conversation"
            @click="emit('newConversation')"
          />
        </div>
      </template>
      <ConversationList
        :conversations="conversations"
        :selected-id="selectedConversationId"
        @select="emit('selectConversation', $event)"
      />
    </UCard>

    <UCard :ui="{ body: 'p-4 sm:p-6' }">
      <template #header>
        <span class="text-highlighted font-semibold">Messages</span>
      </template>
      <div v-if="pending" class="text-muted text-sm">
        Loading…
      </div>
      <ChatMessageList v-else :messages="messages" />
      <ChatComposer class="mt-4" :disabled="sending" @submit="emit('send', $event)" />
    </UCard>
  </div>
</template>
